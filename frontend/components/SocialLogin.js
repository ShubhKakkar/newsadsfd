import React from "react";
import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { Facebook, Google } from "./Svg";

const SocialLogin = ({ request }) => {
  const onSuccessGoogle = (response) => {
    // console.log(response);
    if (response) {
      request("POST", "v1/customer/oauth/google", {
        userData: { ...response.profileObj, id: response.googleId },
      });
      // console.log(profileObj)
    }
  };
  const responseFacebook = (response) => {
    // console.log(response);
    if (response?.accessToken) {
      request("POST", "v1/customer/oauth/facebook", {
        name: response.name,
        email: response.email,
        accessToken: response.accessToken,
        id: response.id,
      });
    }
  };

  const onFailureGoogle = (res) => {
    // console.log(res);
  };

  const componentClicked = (response) => {
    // console.log(response);
  };
  return (
    <>
      <GoogleLogin
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        buttonText="Login"
        render={(renderProps) => (
          <a
            className="google_buttons cursor"
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
          >
            <Google />
          </a>
        )}
        onSuccess={onSuccessGoogle}
        onFailure={onFailureGoogle}
        cookiePolicy={"single_host_origin"}
        uxMode="popup"
        redirectUri={process.env.NEXT_PUBLIC_PROD_FRONTEND_URI}
      />

      <FacebookLogin
        appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
        callback={responseFacebook}
        render={(renderProps) => (
          <a className="facebook_buttons cursor" onClick={renderProps.onClick}>
            <Facebook />
          </a>
        )}
        fields="name,email,picture"
      />
    </>
  );
};

export default SocialLogin;
