import toast from "react-hot-toast";
import { Button } from "reactstrap";

/**
 *? Types:
 *! 1. success
 *! 2. error
 *! 3. info
 *! 4. warning
 *
 * For default toast styling set @param {string} type parameter to empty.
 */

/**
 *
 * @param {string} title Toast title
 * @param {string} message Toast message
 * @param {string} type  Toast type, check note above for more details.
 */
export function hotToastService(title, message, type) {
  var toastSettings;
  switch (type) {
    case "success":
      toastSettings = {
        icon: <i class="fas fa-check-circle" style={{ fontSize: "20px" }}></i>,
        style: {
          padding: "10px",
          color: "#00ab54",
          backgroundColor: "#b5ebcc",
        },
        iconTheme: {
          primary: "#00ab54",
          secondary: "#ffffff",
        },
        dismissStyle:{
          fontSize:'15px',
          color: "#00ab54"
        },
      };
      break;
    case "error":
      toastSettings = {
        icon: <i class="fas fa-times-circle" style={{ fontSize: "20px" }}></i>,
        style: {
          padding: "10px",
          color: "#ff3e2c",
          backgroundColor: "#ffe3e0",
        },
        iconTheme: {
          primary: "#ff3e2c",
          secondary: "#ffffff",
        },
        dismissStyle:{
          fontSize:'15px',
          color: "#ff3e2c"
        },
      };
      break;
    case "info":
      toastSettings = {
        icon: <i class="fas fa-info-circle" style={{ fontSize: "20px" }}></i>,
        style: {
          padding: "10px",
          color: "#0073ff",
          backgroundColor: "#c2edff",
        },
        iconTheme: {
          primary: "#0073ff",
          secondary: "#ffffff",
        },
        dismissStyle:{
          fontSize:'15px',
          color: "#0073ff"
        },
      };
      break;
    case "warning":
      toastSettings = {
        icon: (
          <i class="fas fa-exclamation-circle" style={{ fontSize: "20px" }}></i>
        ),
        style: {
          padding: "10px",
          color: "#ffa300",
          backgroundColor: "#ffe5c7",
        },
        iconTheme: {
          primary: "#ffa300",
          secondary: "#ffffff",
        },
        dismissStyle:{
          fontSize:'15px',
          color: "#ffa300"
        },
      };
      break;
    default:
      toastSettings = {
        style: {
          padding: "10px",
          color: "#000000",
          backgroundColor: "#ffffff",
        },
        iconTheme: {
          primary: "#000000",
          secondary: "#ffffff",
        },
        dismissStyle:{
          fontSize:'15px',
          color: "#000000"
        },
      };
      break;
  }
  toast(
    (t) => (
      <>
        <div
          style={{
            verticalAlign: "top",
            boxSizing: "border-box",
            width: "90%",
          }}
        >
          <p
            style={{
              margin: "0px 0px 5px",
              fontSize: "14px",
              fontWeight: "700",
              lineHeight: "1.42857",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: "0px",
              fontSize: "14px",
              fontWeight: "500",
              lineHeight: "1.42857",
              color: "#27272E",
            }}
          >
            {message}
          </p>
        </div>

        <div
          style={{
            verticalAlign: "top",
            boxSizing: "border-box",
            width: "10%",
          }}
        >
          <button
            aria-label="Close"
            className="close"
            type="button"
            onClick={() => toast.dismiss(t.id)}
          >
            <span>
              <i class="fas fa-times" style={toastSettings.dismissStyle}></i>
            </span>
          </button>
        </div>
      </>
    ),
    toastSettings
  );
}
