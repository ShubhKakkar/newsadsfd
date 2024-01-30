import React from "react";
import ReactPaginate from "react-paginate";

import "./Pagination.css";

const Pagination = ({
  page,
  totalDocuments,
  getNewData,
  perPage,
  defaultPerPage,
  perPageChangeHandler,
  currentDocLength,
}) => {
  return (
    <div className="row">
      <div className="col-sm-12 col-md-5">
        <div className="dataTables_info">
          Showing {totalDocuments ? 1 : 0 + perPage * (page - 1)} to{" "}
          {currentDocLength < perPage ? totalDocuments : perPage * page} of{" "}
          {totalDocuments} entries
        </div>
      </div>

      <div className="col-sm-12 col-md-7">
        <div className="d-flex justify-content-end align-items-center">
          <div className="dataTables_length mr-4">
            <label className="mb-0">
              Show &nbsp; &nbsp;
              <select
                onChange={perPageChangeHandler}
                className="custom-select custom-select-sm form-control form-control-sm"
              >
                <option value={defaultPerPage}>Default</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
          </div>

          <div className="dataTables_paginate paging_full_numbers">
            <ReactPaginate
              forcePage={page - 1}
              pageCount={Math.ceil(totalDocuments / perPage)}
              pageRangeDisplayed={2}
              marginPagesDisplayed={1}
              previousLabel={"<"}
              nextLabel={">"}
              breakLabel={"..."}
              onPageChange={getNewData}
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
              renderOnZeroPageCount={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
