(() => {
  const { useState, useContext, useCallback, useEffect } = React;
  const AppContext = React.createContext();
  const saved_settings = {
    gt_courier_username: gt_courier_settings.module_gt_courier_username || "",
    gt_courier_password: gt_courier_settings.module_gt_courier_password || "",
    gt_courier_route_code: gt_courier_settings.module_gt_courier_route_code || ""
  };
  const gtModuleSaveSettingsLink = `${gt_module_save_settings_link}&user_token=${user_token}`;
  const orderStatusAddLink = `${order_status_add_link}&user_token=${user_token}`;
  const App = () => {
    const [username, setUsername] = useState(saved_settings.gt_courier_username);
    const [password, setPassword] = useState(saved_settings.gt_courier_password);
    const [routeCode, setRouteCode] = useState(
      saved_settings.gt_courier_route_code
    );
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const handleFormSumbit = async (e) => {
      e.preventDefault();
      setLoading(true);
      const settings = {
        module_gt_courier_username: username,
        module_gt_courier_password: password,
        module_gt_courier_route_code: routeCode
      };
      const rawResponse = await fetch(gtModuleSaveSettingsLink, {
        method: "POST",
        body: new URLSearchParams(settings)
      });
      const content = await rawResponse.json();
      let alertType = "alert-success";
      if (content.status !== 200) alertType = "alert-danger";
      setAlerts([{ text: content.msg, type: alertType }, ...alerts]);
      setLoading(false);
      if (is_order_status_added == "false") await addOrderStatus();
    };
    const addOrderStatus = async () => {
      const status = {
        "order_status[1][name]": "GT Courier Voucher"
      };
      await fetch(orderStatusAddLink, {
        method: "POST",
        body: new URLSearchParams(status)
      });
    };
    const alertList = alerts.map((alert, index) => {
      return /* @__PURE__ */ React.createElement("div", { className: `alert ${alert.type} alert-dismissible`, key: index }, alert.type != "alert-danger" && /* @__PURE__ */ React.createElement("i", { className: "fa fa-check-circle" }), " ", alert.text, /* @__PURE__ */ React.createElement("button", { type: "button", className: "close", "data-dismiss": "alert" }, "\xD7"));
    });
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-sm-12" }, alertList)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-sm-4" }, /* @__PURE__ */ React.createElement("form", { onSubmit: (e) => handleFormSumbit(e) }, /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { for: "username" }, "\u038C\u03BD\u03BF\u03BC\u03B1 \u03A7\u03C1\u03AE\u03C3\u03C4\u03B7:"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        id: "username",
        value: username,
        onChange: (e) => setUsername(e.target.value),
        requied: true
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { for: "routeCode" }, "Route Code: \u03C0\u03C1\u03BF\u03B1\u03B9\u03C1\u03B5\u03C4\u03B9\u03BA\u03CC"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "form-control",
        id: "routeCode",
        value: routeCode,
        onChange: (e) => setRouteCode(e.target.value)
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "form-group" }, /* @__PURE__ */ React.createElement("label", { for: "password" }, "\u039A\u03C9\u03B4\u03B9\u03BA\u03CC\u03C2:"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "password",
        className: "form-control",
        id: "password",
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "btn btn-primary",
        disabled: `${loading ? "disabled" : ""}`
      },
      "\u0391\u03C0\u03BF\u03B8\u03B7\u03BA\u03B5\u03C5\u03C3\u03B7"
    )))));
  };
  ReactDOM.render(/* @__PURE__ */ React.createElement(App, null), document.getElementById("settingsRoot"));
})();
