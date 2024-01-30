import ReactPaginate from "react-paginate";
import useTranslate from "@/hooks/useTranslate";

const Pagination = ({ currentPage, totalItems, perPage, fetchMoreItems }) => {
  const t = useTranslate();

  if (totalItems === 0) {
    return null;
  }
  return (
    <ReactPaginate
      previousLabel={t("Previous")}
      nextLabel={t("Next")}
      pageClassName="pagination modal-4"
      pageLinkClassName="pagination modal-4"
      previousClassName="pagination modal-4"
      previousLinkClassName="pagination modal-4"
      nextClassName="pagination modal-4"
      nextLinkClassName="pagination modal-4"
      breakLabel="..."
      breakClassName="pagination modal-4"
      breakLinkClassName="pagination modal-4"
      pageCount={Math.ceil(totalItems / perPage)}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={fetchMoreItems}
      containerClassName="pagination"
      activeClassName="active"
      forcePage={currentPage - 1}
    />
  );
};

export default Pagination;
