export const SHOPIFY_API_VERSION = "2026-07";

const OFFER_QUERY = `
  query MeridianOffer($handle: String!) {
    product(handle: $handle) {
      availableForSale
      variants(first: 10) {
        nodes {
          availableForSale
          id
          price { amount currencyCode }
          sellingPlanAllocations(first: 10) {
            nodes {
              sellingPlan { id name }
              priceAdjustments { price { amount currencyCode } }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation MeridianCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }
`;

export function buildStorefrontEndpoint(shopDomain) {
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(shopDomain)) {
    throw new Error("Invalid Shopify store domain");
  }
  return `https://${shopDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

export function extractOffer(payload, sellingPlanName) {
  const product = payload?.data?.product;
  const variant = product?.variants?.nodes?.find((item) => item.availableForSale);
  if (!product?.availableForSale || !variant) {
    return { available: false };
  }

  const allocation = variant.sellingPlanAllocations?.nodes?.find(
    (item) => item.sellingPlan?.name === sellingPlanName,
  );

  return {
    available: true,
    currencyCode: variant.price.currencyCode,
    oneTimeAmount: Number(variant.price.amount),
    subscriptionAmount: allocation
      ? Number(allocation.priceAdjustments[0].price.amount)
      : null,
    variantId: variant.id,
    sellingPlanId: allocation?.sellingPlan?.id ?? null,
  };
}

export function buildCartLines(offer, mode, quantity) {
  const safeQuantity = Math.max(1, Math.min(6, Number(quantity)));
  const line = { merchandiseId: offer.variantId, quantity: safeQuantity };
  if (mode === "subscription") line.sellingPlanId = offer.sellingPlanId;
  return [line];
}

export function formatMoney(amount, currencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

async function postGraphQL(fetchImpl, endpoint, query, variables) {
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error("Shopify is temporarily unavailable");

  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message);
  return payload;
}

export async function loadOffer({
  endpoint,
  fetchImpl = fetch,
  productHandle,
  sellingPlanName,
}) {
  const payload = await postGraphQL(
    fetchImpl,
    endpoint,
    OFFER_QUERY,
    { handle: productHandle },
  );
  return extractOffer(payload, sellingPlanName);
}

export async function createCheckout({
  endpoint,
  fetchImpl = fetch,
  mode,
  offer,
  quantity,
}) {
  if (mode === "subscription" && !offer.sellingPlanId) {
    throw new Error("Subscription checkout is unavailable");
  }

  const payload = await postGraphQL(
    fetchImpl,
    endpoint,
    CART_CREATE_MUTATION,
    { input: { lines: buildCartLines(offer, mode, quantity) } },
  );
  const result = payload.data?.cartCreate;
  if (result?.userErrors?.length) {
    throw new Error(result.userErrors[0].message);
  }
  if (!result?.cart?.checkoutUrl) {
    throw new Error("Shopify did not return a checkout URL");
  }
  return result.cart.checkoutUrl;
}

export async function initCommerce({
  document: pageDocument = globalThis.document,
  window: pageWindow = globalThis.window,
  fetchImpl = globalThis.fetch,
} = {}) {
  const configElement = pageDocument?.getElementById("shopify-config");
  if (!configElement) return null;

  const config = JSON.parse(configElement.textContent);
  const endpoint = buildStorefrontEndpoint(config.shopDomain);
  const quantityDown = pageDocument.getElementById("qty-down");
  const quantityUp = pageDocument.getElementById("qty-up");
  const quantityOutput = pageDocument.getElementById("qty-output");
  const checkoutButton = pageDocument.getElementById("add-button");
  const status = pageDocument.getElementById("commerce-status");
  const purchaseOptions = [...pageDocument.querySelectorAll("[data-mode]")];

  if (
    !quantityDown
    || !quantityUp
    || !quantityOutput
    || !checkoutButton
    || !status
    || purchaseOptions.length === 0
  ) {
    throw new Error("Meridian purchase controls are incomplete");
  }

  let offer = { available: false };
  let quantity = 1;
  let mode = purchaseOptions.find(
    (option) => option.classList.contains("is-selected"),
  )?.dataset.mode ?? "subscription";

  function selectMode(nextMode) {
    mode = nextMode;
    for (const option of purchaseOptions) {
      const selected = option.dataset.mode === mode;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    }
  }

  function amountFor(optionMode) {
    return optionMode === "subscription"
      ? offer.subscriptionAmount
      : offer.oneTimeAmount;
  }

  function render() {
    quantityOutput.value = String(quantity);
    quantityOutput.textContent = String(quantity);
    quantityDown.disabled = quantity === 1;
    quantityUp.disabled = quantity === 6;

    for (const option of purchaseOptions) {
      const optionMode = option.dataset.mode;
      const amount = amountFor(optionMode);
      const price = option.querySelector(".price");
      if (price) {
        price.textContent = Number.isFinite(amount)
          ? formatMoney(amount, offer.currencyCode)
          : "Unavailable";
      }
      option.disabled = !offer.available
        || (optionMode === "subscription" && !offer.sellingPlanId);
    }

    if (!offer.available) {
      checkoutButton.disabled = true;
      checkoutButton.textContent = "Currently unavailable";
      return;
    }

    const selectedAmount = amountFor(mode);
    const total = Number.isFinite(selectedAmount)
      ? formatMoney(selectedAmount * quantity, offer.currencyCode)
      : null;
    const selectedModeAvailable = mode !== "subscription" || offer.sellingPlanId;
    checkoutButton.disabled = !config.commerceEnabled || !selectedModeAvailable;
    checkoutButton.textContent = config.commerceEnabled && total
      ? `Continue to secure checkout — ${total}`
      : "Checkout not open yet";
  }

  for (const option of purchaseOptions) {
    option.addEventListener("click", () => {
      if (option.disabled) return;
      selectMode(option.dataset.mode);
      render();
    });
  }
  quantityDown.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    render();
  });
  quantityUp.addEventListener("click", () => {
    quantity = Math.min(6, quantity + 1);
    render();
  });
  checkoutButton.addEventListener("click", async () => {
    checkoutButton.disabled = true;
    checkoutButton.textContent = "Opening secure checkout…";
    status.textContent = "Creating your secure Shopify checkout…";
    try {
      const checkoutUrl = await createCheckout({
        endpoint,
        fetchImpl,
        mode,
        offer,
        quantity,
      });
      pageWindow.location.href = checkoutUrl;
    } catch (_error) {
      status.textContent = "Secure checkout is temporarily unavailable. Please retry.";
      render();
    }
  });

  checkoutButton.disabled = true;
  try {
    offer = await loadOffer({
      endpoint,
      fetchImpl,
      productHandle: config.productHandle,
      sellingPlanName: config.sellingPlanName,
    });
    if (!offer.available) {
      status.textContent = "Daily Rebuild is currently unavailable.";
    } else if (!offer.sellingPlanId) {
      selectMode("once");
      status.textContent = config.commerceEnabled
        ? "One-time checkout is available. Subscription checkout is temporarily unavailable."
        : "Checkout is not open yet.";
    } else {
      status.textContent = config.commerceEnabled
        ? "Secure checkout is provided by Shopify."
        : "Checkout is not open yet.";
    }
    render();
  } catch (_error) {
    offer = { available: false };
    status.textContent = "Checkout is temporarily unavailable. Please retry shortly.";
    render();
  }

  return { offer, mode, quantity };
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  initCommerce({ document, window }).catch(() => {});
}
