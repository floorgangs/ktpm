import React, { useEffect, useState } from 'react';
import ItemBlog from '../../component/Blog/ItemBlog';
import RightBlog from '../../component/Blog/RightBlog';
import { PAGINATION } from '../../utils/constant';
import { getAllBlog } from '../../services/userService';
import ReactPaginate from 'react-paginate';
import { getAllCategoryBlogService, getFeatureBlog } from '../../services/userService';
import { Link } from 'react-router-dom';
import './BlogPage.scss';
function BlogPage(props) {
  const [dataBlog, setdataBlog] = useState([]);
  const [dataFeatureBlog, setdataFeatureBlog] = useState([]);
  const [dataSubject, setdataSubject] = useState([]);
  const [count, setCount] = useState(0);
  const [subjectId, setsubjectId] = useState('');
  const [keyword, setkeyword] = useState('');
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
      loadCategoryBlog();
      fetchData('', '');
      loadFeatureBlog();
    } catch (error) {
        console.log(error);
    }

}, [])



let fetchData = async (code, keywordSearch) => {
  let arrData = await getAllBlog({
      subjectId: code,
      limit: PAGINATION.pagerow,
      offset: 0,
      keyword: keywordSearch
  });
  if (arrData && arrData.errCode === 0) {
      setdataBlog(arrData.data);
      const totalPage = arrData.count ? Math.ceil(arrData.count / PAGINATION.pagerow) : 0;
      setCount(totalPage);
    } else {
      setdataBlog([]);
      setCount(0);
    }
};
let loadFeatureBlog = async() =>{
  let res = await getFeatureBlog(6);
  if(res && res.errCode === 0){
    setdataFeatureBlog(res.data);
  } else {
    setdataFeatureBlog([]);
  }
};
let loadCategoryBlog = async() =>{
  let res = await getAllCategoryBlogService('SUBJECT');
  if(res && res.errCode === 0){
      setdataSubject(res.data);
  } else {
      setdataSubject([]);
  }
};
let handleChangePage = async (number) => {
  let arrData = await getAllBlog({
    subjectId: subjectId,
      limit: PAGINATION.pagerow,
      offset: number.selected * PAGINATION.pagerow,
      keyword: keyword

  });
  if (arrData && arrData.errCode === 0) {
      setdataBlog(arrData.data);
    } else {
      setdataBlog([]);
    }
  
};
let handleClickCategory = (code) =>{
  setsubjectId(code);
  fetchData(code,'');

};
let handleSearchBlog = (text) =>{
  fetchData('',text);
  setkeyword(text);
};
let handleOnchangeSearch = (keywordText) =>{
  if(keywordText === ''){
    fetchData('',keywordText);
      setkeyword(keywordText);
   }
  
};
    return (
        <>
        <section className="banner_area">
      <div className="banner_inner d-flex align-items-center">
        <div className="container">
          <div className="banner_content d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h2>Tin tức</h2>
              <p>Hãy theo dõi những bài viết để nhận được thông tin mới nhất</p>
            </div>
            <div className="page_link">
            <Link to={"/"}>Trang chủ</Link>
             <Link to={"/blog"}>Tin tức</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="blog-page">
            <div className="container">
                <div className="blog-page__layout">
                    <div className="blog-page__main">
                        <div className="blog-card-grid">
                           {dataBlog && dataBlog.length > 0 && 
                           dataBlog.map((item,index) =>{
                            return(
                              <ItemBlog key={item.id || index} data={item}></ItemBlog>
                            )
                           })
                           }
                        </div>
                        {count > 1 && (
                          <div className="blog-pagination">
                            <ReactPaginate
                              previousLabel={'Quay lại'}
                              nextLabel={'Tiếp'}
                              breakLabel={'...'}
                              pageCount={count}
                              marginPagesDisplayed={1}
                              pageRangeDisplayed={3}
                              containerClassName={'pagination'}
                              pageClassName={'page-item'}
                              pageLinkClassName={'page-link'}
                              previousClassName={'page-item'}
                              previousLinkClassName={'page-link'}
                              nextClassName={'page-item'}
                              nextLinkClassName={'page-link'}
                              breakClassName={'page-item'}
                              breakLinkClassName={'page-link'}
                              activeClassName={'active'}
                              onPageChange={handleChangePage}
                            />
                          </div>
                        )}
                    </div>
                    <RightBlog handleOnchangeSearch={handleOnchangeSearch} handleSearchBlog={handleSearchBlog} dataFeatureBlog={dataFeatureBlog} isPage={true} handleClickCategory={handleClickCategory} data={dataSubject} />
                </div>
            </div>
        </section>
        
        </>
      

    );
}

export default BlogPage;