import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';

function SpecialItemBlog(props) {
    const createdAt = props?.data?.createdAt ? moment(props.data.createdAt).format('DD/MM/YYYY HH:mm') : '';

    return (
        <div className="featured-post">
            <Link to={`/detail-blog/${props.data.id}`} className="featured-post__thumb" aria-label={props.data.title}>
                <img src={props.data.image} alt={props.data.title} />
            </Link>
            <div className="featured-post__content">
                <Link to={`/detail-blog/${props.data.id}`} className="featured-post__title">
                    {props.data.title}
                </Link>
                {createdAt && <span className="featured-post__date">{createdAt}</span>}
            </div>
        </div>
    );
}

export default SpecialItemBlog;