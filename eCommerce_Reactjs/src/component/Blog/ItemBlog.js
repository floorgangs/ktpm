import moment from 'moment';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './ItemBlog.scss';

function ItemBlog({ data }) {
    const authorName = useMemo(() => {
        const first = data?.userData?.firstName || '';
        const last = data?.userData?.lastName || '';
        const fullName = `${first} ${last}`.trim();
        return fullName.length ? fullName : 'Admin';
    }, [data]);

    const publishedAt = data?.createdAt ? moment(data.createdAt).format('DD MMM, YYYY') : '';
    const commentCount = Array.isArray(data?.commentData) ? data.commentData.length : 0;
    const viewCount = Number(data?.view) || 0;
    const summary = data?.shortdescription || '';
    const categoryName = data?.subjectData?.value || 'Bài viết';

    return (
        <article className="blog-card">
            <Link to={`/detail-blog/${data.id}`} className="blog-card__image" aria-label={data.title}>
                <img src={data.image} alt={data.title} />
                <span className="blog-card__tag">{categoryName}</span>
            </Link>
            <div className="blog-card__body">
                <div className="blog-card__meta">
                    {publishedAt && (
                        <span className="blog-card__meta-item">
                            <i className="far fa-calendar" />
                            {publishedAt}
                        </span>
                    )}
                    <span className="blog-card__meta-item">
                        <i className="far fa-user" />
                        {authorName}
                    </span>
                </div>
                <Link to={`/detail-blog/${data.id}`} className="blog-card__title">
                    {data.title}
                </Link>
                <p className="blog-card__summary">{summary}</p>
                <div className="blog-card__footer">
                    <div className="blog-card__stats">
                        <span>
                            <i className="far fa-eye" />
                            {viewCount}
                        </span>
                        <span>
                            <i className="far fa-comment" />
                            {commentCount}
                        </span>
                    </div>
                    <Link to={`/detail-blog/${data.id}`} className="blog-card__readmore">
                        Đọc thêm
                        <i className="ti-arrow-right" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default ItemBlog;
