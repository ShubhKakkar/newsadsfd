import React, { useEffect } from "react";
import Product from "./Product";

const Content = ({ products, isGridView }) => {
  useEffect(() => {
    if (products.length > 0) {
      $(".featured-text").matchHeight();
      $("#order-scroll").scrollTop();
      const ele = document.getElementById("order-scroll");
      if (ele) {
        // console.log(ele);
        // ele.scrollIntoView({ smooth: true });
      }
    }
  }, [products]);

  return (
    <div
      className={`row align-items-center custom-row products  ${
        isGridView ? "grid" : "list-view"
      }  `}
    >
      {products.map((product, idx) => (
        <Product product={product} key={product.idForCart} />
      ))}
      {products.length === 0 && (
        <div className="nofoundResult">
          <div className="msgTitle">Sorry, no results found!</div>
          <p>Please check the spelling or try searching for something else</p>
        </div>
      )}
    </div>
  );
};

export default Content;
