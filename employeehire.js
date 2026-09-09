(() => {

  "use strict";


  const $ = (
    selector,
    root = document
  ) => root.querySelector(selector);


  const $$ = (
    selector,
    root = document
  ) => Array.from(
    root.querySelectorAll(selector)
  );


  function openTab(
    name,
    focus = false
  ) {

    $$(".tab").forEach(button => {

      const active =
        button.dataset.tab === name;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-selected",
        active ? "true" : "false"
      );

      button.tabIndex =
        active ? 0 : -1;

    });


    $$(".tab-panel").forEach(panel => {

      panel.classList.toggle(
        "active",
        panel.id === `tab-${name}`
      );

    });


    if (focus) {

      const target =
        $(`#tabbtn-${name}`);

      if (target) {
        target.focus();
      }

    }


    try {

      history.replaceState(
        null,
        "",
        `#${name}`
      );

    } catch (error) {
      // Ignore history failures.
    }


    const tabbar =
      $(".tabbar");

    if (tabbar) {

      window.scrollTo({
        top: Math.max(
          0,
          tabbar.offsetTop - 8
        ),
        behavior: "smooth"
      });

    }

  }



  $$(".tab").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openTab(
          button.dataset.tab
        );

      }
    );


    button.addEventListener(
      "keydown",
      event => {

        const tabs =
          $$(".tab");

        const currentIndex =
          tabs.indexOf(button);


        if (
          event.key === "ArrowRight" ||
          event.key === "ArrowLeft"
        ) {

          event.preventDefault();


          const nextIndex =
            event.key === "ArrowRight"
              ? (currentIndex + 1) % tabs.length
              : (
                  currentIndex - 1 + tabs.length
                ) % tabs.length;


          openTab(
            tabs[nextIndex].dataset.tab,
            true
          );

        }

      }
    );

  });



  $$("[data-open-tab]").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openTab(
          button.dataset.openTab
        );

      }
    );

  });



  const validTabs =
    new Set(
      $$(".tab").map(
        item => item.dataset.tab
      )
    );


  const hashTab =
    location.hash.replace("#","");


  if (
    validTabs.has(hashTab)
  ) {

    openTab(hashTab);

  }



  function stampForms() {

    const now =
      new Date().toISOString();


    $$(".js-timestamp").forEach(input => {

      input.value =
        now;

    });


    const timezone =
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || "unknown";


    const timezoneField =
      $("#browser-timezone");


    if (timezoneField) {

      timezoneField.value =
        timezone;

    }


    const dateField =
      $("#agr-date");


    if (
      dateField &&
      !dateField.value
    ) {

      const local =
        new Date();


      const year =
        local.getFullYear();


      const month =
        String(
          local.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          local.getDate()
        ).padStart(
          2,
          "0"
        );


      dateField.value =
        `${year}-${month}-${day}`;

    }

  }


  stampForms();



  async function makeAgreementHash() {

    const agreement =
      $("#agreement-text");


    const output =
      $("#agreement-hash");


    if (
      !agreement ||
      !output ||
      !window.crypto?.subtle
    ) {

      return;

    }


    const normalizedText =
      agreement.innerText
        .replace(
          /\s+/g,
          " "
        )
        .trim();


    const bytes =
      new TextEncoder()
        .encode(
          normalizedText
        );


    const digest =
      await crypto.subtle.digest(
        "SHA-256",
        bytes
      );


    output.value =
      Array.from(
        new Uint8Array(digest)
      )
      .map(
        byte =>
          byte
            .toString(16)
            .padStart(
              2,
              "0"
            )
      )
      .join("");

  }


  makeAgreementHash();



  const printButton =
    $("#print-agreement");


  if (printButton) {

    printButton.addEventListener(
      "click",
      () => {

        window.print();

      }
    );

  }



  const agreementForm =
    $("#agreement-form");


  if (agreementForm) {

    agreementForm.addEventListener(
      "submit",
      async event => {

        stampForms();

        await makeAgreementHash();


        const legalName =
          (
            $("#agr-name")?.value ||
            ""
          )
          .trim()
          .replace(
            /\s+/g,
            " "
          )
          .toLowerCase();


        const signature =
          (
            $("#agr-signature")?.value ||
            ""
          )
          .trim()
          .replace(
            /\s+/g,
            " "
          )
          .toLowerCase();


        const status =
          $("#signature-status");


        if (
          !legalName ||
          legalName !== signature
        ) {

          event.preventDefault();


          status.textContent =
            "Your typed signature must exactly match your full legal name.";


          status.className =
            "signature-status bad";


          $("#agr-signature")?.focus();


          return;

        }


        if (
          !$("#agreement-hash")?.value
        ) {

          event.preventDefault();


          status.textContent =
            "Agreement verification could not be completed. Please reload the page before signing.";


          status.className =
            "signature-status bad";


          return;

        }


        status.textContent =
          "Signature check passed. Submitting your signed agreement…";


        status.className =
          "signature-status good";

      }
    );



    [
      "#agr-name",
      "#agr-signature"
    ].forEach(selector => {

      $(selector)?.addEventListener(
        "input",
        () => {

          const legalName =
            (
              $("#agr-name")?.value ||
              ""
            )
            .trim()
            .replace(
              /\s+/g,
              " "
            )
            .toLowerCase();


          const signature =
            (
              $("#agr-signature")?.value ||
              ""
            )
            .trim()
            .replace(
              /\s+/g,
              " "
            )
            .toLowerCase();


          const status =
            $("#signature-status");


          if (
            !legalName ||
            !signature
          ) {

            status.textContent =
              "";


            status.className =
              "signature-status";


            return;

          }


          if (
            legalName === signature
          ) {

            status.textContent =
              "Names match.";


            status.className =
              "signature-status good";

          } else {

            status.textContent =
              "Your signature must match your full legal name exactly.";


            status.className =
              "signature-status bad";

          }

        }
      );

    });

  }



  /*
    Safety net:
    Stop obvious Social Security numbers
    or card-number patterns from being
    entered in textarea fields.

    This does NOT replace secure
    data-handling procedures.
  */

  const sensitivePattern =
    /\b\d{3}-?\d{2}-?\d{4}\b|\b(?:\d[ -]*?){13,19}\b/;


  $$("textarea").forEach(textarea => {

    textarea.addEventListener(
      "input",
      () => {

        if (
          sensitivePattern.test(
            textarea.value
          )
        ) {

          textarea.setCustomValidity(
            "Do not enter Social Security numbers or payment-card numbers in this form."
          );

        } else {

          textarea.setCustomValidity("");

        }

      }
    );

  });

})();
