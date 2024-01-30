import React, { useEffect, useState, useRef } from "react";

const createPopup = ({ url, title, height, width }) => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  const externalPopup = window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  return externalPopup;
};

const OauthPopup = ({
  title = "",
  width = 500,
  height = 500,
  url,
  children,
  onCode,
  onClose,
  windowState,
}) => {
  const [externalWindow, setExternalWindow] = useState();
  const intervalRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    onContainerClick();
    // setTimeout(() => {
    //   buttonRef.current.click();
    // }, 3000);
  }, []);

  const createPopup = ({ url, title, height, width }) => {
    // const left = window.screenX + (window.outerWidth - width) / 2;
    // const top = window.screenY + (window.outerHeight - height) / 2.5;
    // const externalPopup = window.open(
    //   url,
    //   title,
    //   `width=${width},height=${height},left=${left},top=${top}`
    // );
    windowState.location.href = url;
    return windowState;
  };

  const clearTimer = () => {
    window.clearInterval(intervalRef.current);
  };

  const onContainerClick = () => {
    setExternalWindow(
      createPopup({
        url,
        title,
        width,
        height,
      })
    );
  };

  useEffect(() => {
    if (externalWindow) {
      intervalRef.current = window.setInterval(() => {
        try {
          const currentUrl = externalWindow.location.href;
          if (!currentUrl) {
            clearTimer();
            return;
          }
          const params = new URL(currentUrl).searchParams;
          const code = params.get("order_id");
          if (!code) {
            return;
          }
          onCode(code);
          clearTimer();
          externalWindow.close();
        } catch (error) {
          console.log("error", error);
        } finally {
          if (!externalWindow || externalWindow.closed) {
            onClose();
            clearTimer();
          }
        }
      }, 1000);

      return () => {
        if (externalWindow) externalWindow.close();
        if (onClose) onClose();
      };
    }
  }, [externalWindow]);

  return <div>{children}</div>;

  // return (
  //   <div ref={buttonRef} onClick={onContainerClick}>
  //     {children}
  //   </div>
  // );
};

export default OauthPopup;
