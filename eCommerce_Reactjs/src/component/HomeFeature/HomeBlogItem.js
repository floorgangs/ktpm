import React from 'react';
import { Link } from 'react-router-dom';
import './HomeBlogItem.scss';

function HomeBlogItem(props) {
    const getAuthorName = () => {
        if (props.data.userData) {
            const firstName = props.data.userData.firstName || '';
            const lastName = props.data.userData.lastName || '';
            return `${firstName} ${lastName}`.trim() || 'Admin';
        }
        return 'Admin';
    };

    const getCommentCount = () => {
        if (props.data.commentData && Array.isArray(props.data.commentData)) {
            return props.data.commentData.length;
        }
        return 0;
    };

    return (
        <div className="col-lg-4 col-md-6">
            <div className="blog-card-modern">
                <Link to={`/detail-blog/${props.data.id}`} className="blog-image-wrapper">
                    <img
                        className="blog-image"
                        src={props.data.image}
                        alt={props.data.title}
                    />
                </Link>
                <div className="blog-content">
                    <Link to={`/detail-blog/${props.data.id}`} className="blog-title-link">
                        <h4 className="blog-title">{props.data.title}</h4>
                    </Link>
                    <div className="blog-footer">
                        <div className="blog-meta">
                            <span className="blog-author">
                                <i className="far fa-user"></i> {getAuthorName()}
                            </span>
                            <span className="blog-separator">|</span>
                            <span className="blog-comments">
                                <i className="far fa-comment"></i> {getCommentCount()}
                            </span>
                        </div>
                        <Link to={`/detail-blog/${props.data.id}`} className="blog-read-more">
                            Xem thêm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeBlogItem;
