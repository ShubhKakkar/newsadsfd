import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import Layout from "../components/Layout";
import OauthPopup from "@/components/PaymentPopup";

export default function Custom404() {
  const t = useTranslations("Index");

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsPopupOpen(true);
  //   }, 1000);
  // }, []);

  const onCode = (code) => {
    console.log("code", code);
  };

  return (
    <Layout title="404 | Not Found">
      <section className="section404">
        <div className="container">
          <div className="mainbox">
            <div className="flexEr404">
              <div className="err">4</div>
              <i className="far fa-question-circle fa-spin"></i>
              <div className="err">4</div>
            </div>

            {isPopupOpen && (
              <OauthPopup
                url="https://secure.telr.com/gateway/process_framed.html?o=80C3E0CFB53C09530AD25FC56BA7BA1E1B060EEAAA1CFF91A9F7D8CA6389F6D9"
                onCode={onCode}
                onClose={() => console.log("closed")}
              ></OauthPopup>
            )}

            {/* <iframe
              // ref={zohoRef}
              id="telr"
              width="768"
              height="998"
              src="https://secure.telr.com/gateway/process_framed.html?o=8C1BD4FEC2107ACA2011DFA2806E8BCEEA3105580C69C671E53871B1BC2B9420"
              style={{ border: "none" }}
              title="subscribe"
              // onLoad={(...args) => {
              //   console.log(args);
              //   console.log(zohoRef.current.contentWindow.location.href);
              // }}
              // sandbox="allow-forms allow-scripts"
              // sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              sandbox="allow-forms allow-modals allow-popups-to-escape-sandbox allow-popups allow-scripts allow-top-navigation allow-same-origin"
            ></iframe> */}

            <div className="msg">
              <p>
                Maybe this page moved? Got deleted? Is hiding out in quarantine?
                Never existed in the first place?
              </p>
              <Link href="/" legacyBehavior>
                <a>Let's go Home and try from there</a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      locales: {
        ...require(`../locales/index/${locale}.json`),
      },
    },
  };
}
