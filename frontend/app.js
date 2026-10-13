
async function checkHealth() {
  const response = await fetch("/health");

  const data = await response.json();

  document.getElementById("health").textContent =
    JSON.stringify(data);
}


async function loadRestaurants() {
  const response = await fetch("/api/restaurants");

  const data = await response.json();

  const container =
    document.getElementById("restaurants");

  container.innerHTML = "";

  data.data.forEach(restaurant => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>
        ${restaurant.name}
      </h3>

      <p>
        ${restaurant.address}
      </p>

      <p>
        Status:
        ${restaurant.status}
      </p>

      <button
        onclick="loadMenu(${restaurant.id})"
      >
        View Menu
      </button>

      <div
        id="menu-${restaurant.id}"
      ></div>
    `;

    container.appendChild(div);
  });
}


async function loadMenu(restaurantId) {
  const response =
    await fetch(
      `/api/restaurants/${restaurantId}/menu`
    );

  const data = await response.json();

  const container =
    document.getElementById(
      `menu-${restaurantId}`
    );

  container.innerHTML = "";

  data.data.forEach(item => {
    const p =
      document.createElement("p");

    p.textContent =
      `${item.id} - ${item.name} - ${item.price}`;

    container.appendChild(p);
  });
}


async function createOrder() {
  const restaurantId =
    Number(
      document.getElementById(
        "restaurantId"
      ).value
    );

  const menuItemId =
    Number(
      document.getElementById(
        "menuItemId"
      ).value
    );

  const quantity =
    Number(
      document.getElementById(
        "quantity"
      ).value
    );

  const response =
    await fetch(
      "/api/orders",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          restaurantId,
          items: [
            {
              menuItemId,
              quantity
            }
          ]
        })
      }
    );

  const data =
    await response.json();

  document.getElementById(
    "orderResult"
  ).textContent =
    JSON.stringify(data);
}