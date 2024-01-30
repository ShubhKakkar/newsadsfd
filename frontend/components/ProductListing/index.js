import React, { useState } from "react";
import TopBar from "./TopBar";
import Content from "./Content";

const ProductListing = ({ totalProducts, currentPage, products, register }) => {
  const [isGridView, setIsGridView] = useState(true);

  return (
    <>
      <TopBar
        isGridView={isGridView}
        setIsGridView={setIsGridView}
        totalProducts={totalProducts}
        currentPage={currentPage} 
        products={products}
        register={register}
      />
      <Content products={products} isGridView={isGridView} />
    </>
  );
};

export default ProductListing;
