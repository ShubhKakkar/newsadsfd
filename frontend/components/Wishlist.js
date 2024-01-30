import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import useRequest from "@/hooks/useRequest";

const Wishlist = ({ isWishlistedProp, id, type, productType }) => {
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedProp);
  const { loggedIn, role } = useSelector((state) => state.auth);

  const { request, response } = useRequest();

  const router = useRouter();

  useEffect(() => {
    if (response) {
      if (isWishlisted) {
        toast.success("Removed from wishlist successfully");
      } else {
        toast.success("Added to wishlist successfully");
      }
      setIsWishlisted((prev) => !prev);
    }
  }, [response]);

  const toggleWishlist = () => {
    if (!loggedIn) {
      router.push("/customer/login");
      return;
    }

    if (role === "vendor") {
      return;
    }

    if (isWishlisted) {
      request("PUT", "v1/wishlist/remove", { id });
    } else {
      request("POST", "v1/wishlist/add", { id, type, productType });
    }
  };

  return (
    <>
      {role !== "vendor" && (
        <a onClick={toggleWishlist} className="likePro cursor">
          {isWishlisted ? (
            <i
              className="fas fa-heart"
              style={{ color: "#ff0000", fontWeight: 900 }}
            ></i>
          ) : (
            <i className="far fa-heart" />
          )}
        </a>
      )}
    </>
  );
};

export default Wishlist;
