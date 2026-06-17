(() => {
  const { useState, useContext, useMemo, useEffect } = React;
  const AppContext = React.createContext();
  const additionalChargesData = [
    {
      id: "pdl01",
      text: "\u03A0\u0391\u03A1\u0391\u0394\u039F\u03A3\u0397-\u03A0\u0391\u03A1\u0391\u039B\u0391\u0392\u0397"
    },
    {
      id: "pdl02",
      text: "\u03A0\u0391\u03A1\u0391\u0394\u039F\u03A3\u0397 \u03A3\u0391\u0392B\u0391\u03A4\u039F\u03A5"
    },
    {
      id: "pdl03",
      text: "\u03A0\u0391\u03A1\u0391\u0394\u039F\u03A3\u0397 RECEPTION"
    }
  ];
  const COD_METHOD_NAMES = [
    "cash on delivery",
    "cod",
    "\u03B1\u03BD\u03C4\u03B9\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE",
    "\u03B1\u03BD\u03C4\u03B9\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03B7"
  ];
  const urlSearchParams = new URLSearchParams(window.location.search);
  const gtCourierModuleRoute = "extension/module/gt_courier";
  const orderHistoryRoute = "api/order/history";
  const userToken = urlSearchParams.get("user_token");
  const orderId = urlSearchParams.get("order_id");
  const moduleLink = `${window.location.origin}${window.location.pathname}?route=${gtCourierModuleRoute}&user_token=${userToken}`;
  const isPaymentMethodCOD = (str) => {
    return COD_METHOD_NAMES.includes(str.toLowerCase());
  };
  function getGtCourierOrderStatusId() {
    const options = $("#input-order-status").find("option");
    let gtCourierStatusId = -1;
    options.each(function() {
      const text = $(this).text();
      const value = $(this).val();
      if (text == "GT Courier Voucher") gtCourierStatusId = value;
      return;
    });
    return gtCourierStatusId;
  }
  const App = () => {
    const [order, setOrder] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [isCOD, setIsCOD] = useState(false);
    const [additionalCharges, setAdditionlCharges] = useState([]);
    const [orderNotes, setOrderNotes] = useState("");
    const [voucher, setVoucher] = useState("");
    const [voucherUrl, setVoucherUrl] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [openVoucherOnNewTab, setOpenVoucherOnNewTab] = useState(false);
    const orderTotal = parseFloat(order.total).toFixed(2);
    useEffect(async () => {
      await getOrderInfo();
    }, []);
    const getOrderInfo = async () => {
      setLoading(true);
      const url = `${window.location.origin}${window.location.pathname}?route=${gtCourierModuleRoute}/get_order_info&user_token=${userToken}&order_id=${orderId}`;
      const rawResponse = await fetch(url);
      const response = await rawResponse.json();
      setLoading(false);
      if (response.status !== 200) {
        setAlerts([{ text: response.msg, type: "alert-danger" }, ...alerts]);
        return;
      }
      if (response.data.voucher) {
        setVoucher(response.data.voucher);
      }
      if (response.data.has_settings == "false") {
        setDisabled(true);
      }
      setOrderNotes(response.data.comment);
      setOrder(response.data);
      setIsCOD(isPaymentMethodCOD(response.data.payment_method));
    };
    const handleAdditionalChargesChange = (e, itemToAdd) => {
      let filteredAdditionalCharges = additionalCharges.filter(
        (item) => item !== itemToAdd.id
      );
      if (e.target.checked) filteredAdditionalCharges.push(itemToAdd.id);
      setAdditionlCharges(filteredAdditionalCharges);
    };
    const handleOnSubmit = async () => {
      setLoading(true);
      const voucherData = createVoucherData();
      const voucherRawResponse = await createVoucher(voucherData);
      const voucherResponse = await voucherRawResponse.json();
      setLoading(false);
      if (voucherResponse.status !== 201) {
        voucherResponse.data.forEach(({ error }) => {
          addAlert(error.title);
        });
        return;
      }
      const voucherUrl2 = createVoucherPdfUrl(
        voucherResponse.data.p01,
        //voucherResponse.data.nr01,
        voucherResponse.sid
      );
      if (openVoucherOnNewTab) openVoucherPfg(voucherUrl2);
      await saveOrderGTVoucher(voucherResponse.data.p01);
    };
    const openVoucherPfg = (url) => {
      window.open(url);
    };
    const createVoucherPdfUrl = (voucher2, sid) => {
      const voucherId = voucher2.split("-")[1];
      var voucherUrl2 = "https://login.gtcourier.gr/hermes_api/courier/print_voucher";
      var voucherUrlParamsObj = {
        hcou01nr01: 1801,
        position: 1,
        voucher: voucher2,
        // voucher p01
        "voucher[1]": voucherId,
        // voucher id nr01
        sid
        // session id
      };
      var voucherUrlParams = new URLSearchParams(voucherUrlParamsObj).toString();
      voucherUrl2 += "?" + voucherUrlParams;
      setVoucher(voucher2);
      setVoucherUrl(voucherUrl2);
      return voucherUrl2;
    };
    const createVoucher = async (voucherData) => {
      const url = `${window.location.origin}${window.location.pathname}?route=${gtCourierModuleRoute}/create_voucher&user_token=${userToken}&order_id=${orderId}`;
      const response = await fetch(url, {
        method: "POST",
        body: new URLSearchParams(voucherData)
      });
      return response;
    };
    const createVoucherData = () => {
      const deliveryAddress = order.delivery_address;
      const voucherData = {
        p126: 2,
        // type
        p0201: deliveryAddress.first_name + " " + deliveryAddress.last_name,
        p0204country: deliveryAddress.country,
        p0202: deliveryAddress.address_1 + " " + deliveryAddress.address_2,
        p0203: deliveryAddress.city,
        p0208: deliveryAddress.postcode,
        p0206: order.telephone,
        p0210: order.email,
        p101: parseFloat(order.weight) > 0 ? order.weight : 0.2,
        p0207: orderNotes,
        lang: "GR"
      };
      voucherData.p022 = isCOD ? orderTotal : 0;
      if (order.gt_route_code != " ") voucherData.p0100 = order.gt_route_code;
      additionalCharges.forEach((item) => voucherData[item] = 1);
      return voucherData;
    };
    const saveOrderGTVoucher = async (voucher2) => {
      const pathname = window.location.pathname.replace("admin/", "");
      const url = `${window.location.origin}${pathname}?route=${orderHistoryRoute}&api_token=${gt_api_token}&store_id=${order.store_id}&order_id=${orderId}`;
      const statusId = getGtCourierOrderStatusId();
      const status = {
        order_status_id: statusId,
        notify: 0,
        override: 0,
        append: 0,
        comment: voucher2
      };
      if (statusId === -1) {
        return;
      }
      await fetch(url, {
        method: "POST",
        body: new URLSearchParams(status)
      });
    };
    const handleOnPrintVoucher = async () => {
      if (voucherUrl) {
        openVoucherPfg(voucherUrl);
        return;
      }
      setLoading(true);
      const url = `${window.location.origin}${window.location.pathname}?route=${gtCourierModuleRoute}/get_session_id&user_token=${userToken}&order_id=${orderId}`;
      const responseRaw = await fetch(url);
      const response = await responseRaw.json();
      if (response.status !== 200) {
        addAlert(response.msg);
        return;
      }
      const session = response.sid;
      const pdfUrl = createVoucherPdfUrl(voucher, session);
      openVoucherPfg(pdfUrl);
      setLoading(false);
    };
    const addAlert = (alert) => {
      setAlerts([{ text: alert, type: "alert-info" }, ...alerts]);
    };
    const additionalChargesList = additionalChargesData.map((item, index) => {
      return /* @__PURE__ */ React.createElement("div", { className: "checkbox", key: index }, /* @__PURE__ */ React.createElement("label", null, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          onChange: (e) => handleAdditionalChargesChange(e, item)
        }
      ), " ", /* @__PURE__ */ React.createElement("span", null, " ", item.text)));
    });
    const alertList = alerts.map((alert, index) => {
      return /* @__PURE__ */ React.createElement("div", { className: `alert ${alert.type} alert-dismissible`, key: index }, alert.text, /* @__PURE__ */ React.createElement("button", { type: "button", className: "close", "data-dismiss": "alert" }, "\xD7"));
    });
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        onSubmit: handleOnSubmit,
        onPrintVoucher: handleOnPrintVoucher,
        loading,
        voucher,
        disabled
      },
      alerts.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "form-group " }, alertList),
      /* @__PURE__ */ React.createElement("div", { className: "form-group " }, /* @__PURE__ */ React.createElement("label", null, "\u0391\u03C0\u03BF\u03C3\u03C4\u03BF\u03BB\u03AE \u03BC\u03B5 \u03B1\u03BD\u03C4\u03B9\u03BA\u03B1\u03C4\u03B1\u03B2\u03BF\u03BB\u03AE ?"), /* @__PURE__ */ React.createElement("div", { className: "checkbox" }, /* @__PURE__ */ React.createElement("label", null, order && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: isCOD,
          onChange: (e) => setIsCOD((prevState) => !prevState)
        }
      ), " ", /* @__PURE__ */ React.createElement("span", null, " ", "(", isCOD ? "\u039D\u03B1\u03B9" : "\u039F\u03C7\u03B9", ") \u03A3\u03CD\u03BD\u03BF\u03BB\u03BF", " ", parseFloat(order.total).toFixed(2), " ", order.currency_code))))),
      /* @__PURE__ */ React.createElement("div", { className: "form-group " }, /* @__PURE__ */ React.createElement("label", null, "\u0395\u03C0\u03B9\u03C0\u03BB\u03AD\u03BF\u03BD \u03C0\u03B5\u03B4\u03AF\u03B1"), additionalChargesList),
      /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { for: "gt_order_comments" }, "\u03A3\u03B7\u03BC\u03B5\u03B9\u03CE\u03C3\u03B5\u03B9\u03C2 \u03C0\u03B1\u03C1\u03B1\u03B3\u03B3\u03B5\u03BB\u03AF\u03B1\u03C2"), /* @__PURE__ */ React.createElement(
        "textarea",
        {
          class: "form-control",
          id: "gt_order_comments",
          rows: "3",
          onChange: (e) => setOrderNotes(e.target.value),
          value: orderNotes
        }
      )),
      /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", null, "\u0386\u03BD\u03BF\u03B9\u03B3\u03BC\u03B1 voucher \u03C3\u03B5 \u03BD\u03AD\u03B1 \u03BA\u03B1\u03C1\u03C4\u03AD\u03BB\u03B1 \u03BA\u03B1\u03C4\u03AC \u03C4\u03B7\u03BD \u03B4\u03B7\u03BC\u03B9\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1"), /* @__PURE__ */ React.createElement("div", { className: "checkbox" }, /* @__PURE__ */ React.createElement("label", null, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: openVoucherOnNewTab,
          onChange: (e) => setOpenVoucherOnNewTab((prevState) => !prevState)
        }
      ), " ", "(", openVoucherOnNewTab ? "\u039D\u03B1\u03B9" : "\u039F\u03C7\u03B9", ")"))),
      /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { for: "gt_order_comments" }, "\u03A5\u03C0\u03AC\u03C1\u03C7\u03C9\u03BD Voucher"), /* @__PURE__ */ React.createElement("input", { value: voucher, className: "form-control", readonly: true }))
    );
  };
  const Modal = ({
    children,
    onSubmit,
    onPrintVoucher,
    loading,
    voucher,
    disabled
  }) => {
    const footerBtns = () => {
      if (disabled) {
        return /* @__PURE__ */ React.createElement("div", { className: "alert alert-danger text-left" }, "\u03A0\u03B1\u03C1\u03B1\u03BA\u03B1\u03BB\u03CE \u03B5\u03B9\u03C3\u03AC\u03B3\u03B5\u03C4\u03B5 \u03C4\u03B1 \u03C3\u03C4\u03BF\u03B9\u03C7\u03B5\u03AF\u03B1 \u03C4\u03BF\u03C5 \u03BB\u03BF\u03B3\u03B1\u03C1\u03B9\u03B1\u03C3\u03BC\u03BF\u03CD \u03C3\u03B1\u03C2.", " ", /* @__PURE__ */ React.createElement("a", { href: moduleLink }, "\u03A1\u03C5\u03B8\u03BC\u03AF\u03C3\u03B5\u03B9\u03C2"));
      }
      if (loading) {
        return /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-secondary" }, "Loading...");
      }
      if (!loading) {
        return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "pull-left" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "btn btn-secondary",
            "data-dismiss": "modal"
          },
          "\u039A\u03BB\u03B5\u03AF\u03C3\u03B9\u03BC\u03BF"
        )), voucher && /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: () => onPrintVoucher()
          },
          "\u0395\u03BA\u03C4\u03CD\u03C0\u03C9\u03C3\u03B7 \u03C5\u03C0\u03AC\u03C1\u03C7\u03C9\u03BD Voucher"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: `btn ${voucher ? "btn-secondary" : "btn-primary"}`,
            onClick: () => onSubmit()
          },
          voucher ? "\u0394\u03B7\u03BC\u03B9\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 \u03BD\u03AD\u03BF\u03C5 Voucher" : "\u0394\u03B7\u03BC\u03B9\u03BF\u03C5\u03C1\u03B3\u03AF\u03B1 Voucher"
        ));
      }
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "modal fade",
        id: "gtCourierVoucherModal",
        tabindex: "-1",
        role: "dialog",
        "aria-labelledby": "gtCourierVoucherModal",
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React.createElement("div", { className: "modal-dialog", role: "document" }, /* @__PURE__ */ React.createElement("div", { className: "modal-content" }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "close",
          "data-dismiss": "modal",
          "aria-label": "Close"
        },
        /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\xD7")
      ), /* @__PURE__ */ React.createElement("h5", { className: "modal-title" }, "GT Courier Voucher")), /* @__PURE__ */ React.createElement("div", { className: "modal-body p-4" }, children), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, footerBtns())))
    );
  };
  ReactDOM.render(/* @__PURE__ */ React.createElement(App, null), document.getElementById("gtCourierVoucher"));
})();
