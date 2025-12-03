import React from 'react';

function ItemCategory(props) {
  const handleClickCategory = (code) => {
    props.handleClickCategory(code);
  };

  const isActive = props.data.code === props.activeLinkId;
  const countNumber = Number(props.data.countPost);
  const hasCount = Number.isFinite(countNumber) && countNumber > 0;

  return (
    <button
      type="button"
      onClick={() => handleClickCategory(props.data.code)}
      className={`blog-chip${isActive ? ' active' : ''}`}
    >
      <span className="blog-chip__label">{props.data.value}</span>
      {hasCount && <span className="blog-chip__count">{countNumber}</span>}
    </button>
  );
}

export default ItemCategory;
