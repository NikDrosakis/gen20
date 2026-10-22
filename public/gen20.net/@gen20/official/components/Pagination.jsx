
import React from 'react';
import { Link } from 'react-router-dom';

const Pagination = ({ currentPage = 1, totalPages = 2, baseUrl = "/" }) => {
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="row">
            <div className="col-lg-12">
                <div className="pagination__option blog__pagi flex justify-center items-center gap-2 py-4">
                    {prevPage && (
                        <Link to={`${baseUrl}?page=${prevPage}`} className="arrow__pagination left__arrow">
                            <span className="arrow_left"></span> Prev
                        </Link>
                    )}

                    {pageNumbers.map((num) => (
                        <Link
                            key={num}
                            to={`${baseUrl}?page=${num}`}
                            className={`number__pagination ${num === currentPage ? 'active' : ''}`}
                        >
                            {num}
                        </Link>
                    ))}

                    {nextPage && (
                        <Link to={`${baseUrl}?page=${nextPage}`} className="arrow__pagination right__arrow">
                            Next <span className="arrow_right"></span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Pagination;
