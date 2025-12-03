import React, { useEffect, useMemo, useState } from 'react';
import FormSearch from '../Search/FormSearch';
import ItemCategory from './ItemCategory';
import SpecialItemBlog from './SpecialItemBlog';

function RightBlog(props) {
    const [dataCategory, setDataCategory] = useState([]);
    const [activeLinkId, setActiveLinkId] = useState('');
    const [dataFeatureBlog, setDataFeatureBlog] = useState([]);

    useEffect(() => {
        if (props.data) {
            setDataCategory(props.data);
        }
        if (props.dataFeatureBlog) {
            setDataFeatureBlog(props.dataFeatureBlog);
        }
    }, [props.data, props.dataFeatureBlog]);

    const totalCount = useMemo(() => {
        return dataCategory.reduce((sum, item) => {
            const value = Number(item?.countPost);
            return Number.isFinite(value) ? sum + value : sum;
        }, 0);
    }, [dataCategory]);

    const handleClickCategory = (code) => {
        props.handleClickCategory(code);
        setActiveLinkId(code);
    };

    const handleSearchBlog = (keyword) => {
        props.handleSearchBlog(keyword);
    };

    const handleOnchangeSearch = (keyword) => {
        props.handleOnchangeSearch(keyword);
    };

    return (
        <aside className="blog-sidebar">
            {props.isPage === true && (
                <>
                    <div className="blog-sidebar__section blog-sidebar__search">
                        <FormSearch title="tiêu đề" handleOnchange={handleOnchangeSearch} handleSearch={handleSearchBlog} />
                    </div>

                    <div className="blog-sidebar__section">
                        <h4 className="blog-sidebar__title">Danh mục</h4>
                        <div className="blog-sidebar__chips">
                            <ItemCategory
                                activeLinkId={activeLinkId}
                                handleClickCategory={handleClickCategory}
                                data={{ value: 'Tất cả', code: '', countPost: totalCount }}
                            />
                            {dataCategory.map((item, index) => (
                                <ItemCategory
                                    activeLinkId={activeLinkId}
                                    handleClickCategory={handleClickCategory}
                                    key={item.code || index}
                                    data={item}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="blog-sidebar__section">
                <h4 className="blog-sidebar__title">Bài viết nổi bật</h4>
                <div className="blog-sidebar__featured">
                    {dataFeatureBlog &&
                        dataFeatureBlog.length > 0 &&
                        dataFeatureBlog.map((item, index) => (
                            <SpecialItemBlog key={item.id || index} data={item} />
                        ))}
                </div>
            </div>
        </aside>
    );
}

export default RightBlog;