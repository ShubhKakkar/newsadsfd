import { useState, useEffect } from "react";

import useRequest from "../../../hooks/useRequest";

import AlternateProductsModal from "./AlternateProductsModal";

export const AlternateProducts = ({
  setSelectedProductsObjects,
  selectedProductsObject,
  productId,
}) => {
  const [isSimilarProductsModalOpen, setIsSimilarProductsModalOpen] =
    useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  const { response, request } = useRequest();
  const { response: responseSearchData, request: requestSearchData } =
    useRequest();

  useEffect(() => {
    if (productId) {
      request("GET", `product/alternate?productId=${productId}`);
    } else {
      request("GET", `product/alternate`);
    }
    // requestSearchData("GET", "product/alternate-search");
  }, []);

  useEffect(() => {
    if (response) {
      setSimilarProducts(response.similarProducts);
    }
  }, [response]);

  useEffect(() => {
    if (responseSearchData) {
      const { searchBrands, searchCategories, searchVendors } =
        responseSearchData;

      setBrands(searchBrands);
      setCategories(searchCategories);
      setVendors(searchVendors);
    }
  }, [responseSearchData]);

  const removeSelectedProduct = (id) => {
    setSelectedProductsObjects((prev) => ({
      ids: prev.ids.filter((i) => i !== id),
      data: prev.data.filter((d) => d.id !== id),
    }));
  };

  return (
    <>
      <div
        className="tab-pane fade"
        id="kt_tab_pane_7"
        role="tabpanel"
        aria-labelledby="kt_tab_pane_7"
        style={{ minHeight: 490 }}
      >
        <div>
          <h3 className="mb-10 font-weight-bold text-dark">
            Alternate Products
          </h3>
        </div>
        <div className="text-right pb-5 pe-0">
          <button
            onClick={() => {
              setIsSimilarProductsModalOpen(true);
            }}
            type="button"
            className="btn btn-primary"
          >
            Add New
          </button>
        </div>
        {selectedProductsObject.ids.length > 0 && (
          <div className="custom">
            <table>
              <tr>
                <th>Product Name</th>
                <th>Action</th>
              </tr>
              {selectedProductsObject.data.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td
                    onClick={() => {
                      removeSelectedProduct(p.id);
                    }}
                  >
                    <button type="button" className="btn btn-bg-danger">
                      <i style={{ color: "#fff" }} class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </table>
          </div>
        )}
      </div>
      <AlternateProductsModal
        setSelectedProductsObjects={setSelectedProductsObjects}
        isSimilarProductsModalOpen={isSimilarProductsModalOpen}
        setIsSimilarProductsModalOpen={setIsSimilarProductsModalOpen}
        similarProducts={similarProducts}
        selectedProductsObject={selectedProductsObject}
        brands={brands}
        categories={categories}
        vendors={vendors}
      />
    </>
  );
};
