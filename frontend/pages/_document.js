import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {

  render() {
    return (
      <Html lang={this.props.locale} dir={this.props.locale === "en" ? "ltr" : "rtl"}>
        <Head>
          <link rel="shortcut icon" href="/assets/img/favicon/favicon.ico" />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/bootstrap.min.css"
          />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/dashboard.css"
          />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/dashboard-responsive.css"
          />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/font-awesome.css"
          />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/swiper-bundle.min.css"
          />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/niceCountryInput.css"
          />

          <link rel="stylesheet" type="text/css" href="/assets/css/style.css" />
          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/example.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/ion.rangeSlider.css"
          />

          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/responsive.css"
          />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.0.47/jquery.fancybox.min.css"
            rel="stylesheet"
          />
          <link rel="stylesheet" type="text/css" href="/assets/css/rtl.css" />
          {/* <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/animation.css"
          /> */}
          {/* <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/ionicons.min.css"
          /> */}

          {/* 
          <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/jquery.mCustomScrollbar.css"
          /> */}

          {/* <link
            rel="stylesheet"
            type="text/css"
            href="/assets/css/sumoselect.min.css"
          /> */}
        </Head>
        <body className="btmBodySpace">
          <Main></Main>
          <NextScript />
          <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>

          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
            crossorigin="anonymous"
          ></script>

          <script
            type="text/javascript"
            src="https://cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.7.2/jquery.matchHeight-min.js"
            crossorigin="anonymous"
          ></script>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.0.47/jquery.fancybox.min.js"></script>

          {/* <script
            type="text/javascript"
            src="/assets/js/popper.min.js"
          ></script> */}
          {/* <script
            type="text/javascript"
            src="/assets/js/bootstrap.min.js"
          ></script> */}
          {/* <script type="text/javascript" src="/assets/js/wow.js"></script> */}

          <script
            defer
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBd9YE72JKqOfvadJJ6W6SOKZDod6io45g&libraries=places"
          ></script>
          <script
            type="text/javascript"
            src="/assets/js/swiper-bundle.min.js"
          ></script>
          <script
            type="text/javascript"
            src="/assets/js/niceCountryInput.js"
          ></script>
          <script
            type="text/javascript"
            src="/assets/js/ion.rangeSlider.min.js"
          ></script>
          {/* <script
            type="text/javascript"
            src="/assets/js/owl.carousel.min.js"
          ></script> */}
          <script
            type="text/javascript"
            src="/assets/js/theia-sticky-sidebar.js"
          ></script>
          <script type="text/javascript" src="/assets/js/script.js"></script>

          {/* <Script src="https://www.googletagmanager.com/gtag/js?id=AW-11465010783" />
          <Script id="google-analytics">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'AW-11465010783');
        `}
          </Script> */}
        </body>
      </Html>
    );
  }
}

export default MyDocument;
