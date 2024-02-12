import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductSkeleton = () => {
  return (
    <div className="product-skeleton">
      <div className="product-image">
        <Skeleton height={200} />
      </div>
      <div className="product-details">
        <h2>
          <Skeleton width={200} />
        </h2>
        <p>
          <Skeleton count={3} />
        </p>
        <div className="price">
          <Skeleton width={100} />
        </div>
        <button disabled>
          <Skeleton width={100} />
        </button>
      </div>
    </div>
  );
};

export default ProductSkeleton;
