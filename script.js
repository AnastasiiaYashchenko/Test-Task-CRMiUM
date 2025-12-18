ZOHO.embeddedApp.on("PageLoad", async function (data) {
  const dealId = data.EntityId;
  let nbuRate = 0;
  let dealRate = 0;

  async function loadLocale(locale) {
    localStorage.setItem("locale", locale);
    const response = await fetch(`/${locale}.json`);
    const data = await response.json();
    document.querySelectorAll("[data-key]").forEach((element) => {
      const key = element.getAttribute("data-key");
      if (data[key]) {
        element.textContent = data[key];
      }
    });
  }
  const languageSelector = document.getElementById("language-selector");
  languageSelector.addEventListener("change", (event) => {
    loadLocale(event.target.value);
  });

  const savedLocale = localStorage.getItem("locale") || "ua";
  loadLocale(savedLocale);
  languageSelector.value = savedLocale;

  fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/dollar_info?json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error when displaying the NBU exchange rate");
      }
      return response.json();
    })
    .then((json) => {
      nbuRate = json[0].rate;
      document.getElementById("nbuRate").innerText = nbuRate.toFixed(2);
      loadDeal();
      const currentLocale = localStorage.getItem("locale") || "ua";
      if (currentLocale === "ua") {
        setOutput("Курс НБУ отримано");
      } else if (currentLocale === "en") {
        setOutput("NBU rate received");
      }
    });
  function loadDeal() {
    ZOHO.CRM.API.getRecord({ Entity: "Deals", EntityId: dealId }).then(
      (res) => {
        dealRate = res.data[0].deal_rate;
        document.getElementById("dealRate").innerText = dealRate || "—";
        calculateDiff();
      }
    );
  }
  function calculateDiff() {
    if (!dealRate) return;

    const diff = (dealRate / nbuRate - 1) * 100;
    document.getElementById("diff").innerText = diff.toFixed(1) + "%";

    document.getElementById("saveBtn").style.display =
      Math.abs(diff) >= 5 ? "block" : "none";
  }

  document.getElementById("saveBtn").addEventListener("click", function () {
    const currentLocale = localStorage.getItem("locale") || "ua";
    if (currentLocale === "ua") {
      setTimeout(() => {
        setOutput("Кнопку було натиснуто");
      }, "1000");
    } else if (currentLocale === "en") {
      setTimeout(() => {
        setOutput("The button was pressed");
      }, "1000");
    }
    let fun = {
      Entity: "Deals",
      RecordId: dealId,
      APIData: { id: dealId, deal_rate: nbuRate.toFixed(1) },
      Trigger: ["workflow"],
    };
    ZOHO.CRM.API.updateRecord(fun)
      .then(function (data) {
        console.log("Update success:", data);
        document.getElementById("saveBtn").style.display = "none";

        const currentLocale = localStorage.getItem("locale") || "ua";
        if (currentLocale === "ua") {
          setTimeout(() => {
            setOutput("Курс оновлено");
          }, "4000");
        } else if (currentLocale === "en") {
          setTimeout(() => {
            setOutput("Rate updated");
          }, "4000");
        }
      })
      .catch(function (error) {
        console.error("Full error:", JSON.stringify(error, null, 2));
      });
  });

  function setOutput(outputContent) {
    document.querySelector("#output").textContent = outputContent;
  }
});
ZOHO.embeddedApp.init();
