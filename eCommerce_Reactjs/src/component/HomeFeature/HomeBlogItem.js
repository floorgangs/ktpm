import React from 'react';
import { Link } from 'react-router-dom';

function HomeBlogItem(props) {
    return (
        <div className="col-lg-4 col-md-6">
            <div className="single-blog">
                <div className="thumb">
                    <img
                        style={{ width: '350px', height: '243px', objectFit: 'cover', cursor: 'pointer' }}
                        className="img-fluid"
                        src={props.data.image}
                        alt=""
                    />
                </div>
                <div className="short_details">
                    <div className="meta-top d-flex">
                        <span style={{ cursor: 'pointer', color: '#007bff' }}>
                            {props.data.userData.firstName + " " + props.data.userData.lastName}
                        </span>
                        <span style={{ cursor: 'pointer', color: '#007bff' }}>
                            <i className="ti-comments-smiley" /> {props.data.commentData.length} Bình luận
                        </span>
                    </div>

                    <Link className="d-block" to={`/blog-detail/${props.data.id}`}>
                        <h4>{props.data.title}</h4>
                    </Link>

                    <div className="text-wrap">
                        <p>{props.data.description}</p>
                    </div>

                    <Link className="blog_btn" to={`/blog-detail/${props.data.id}`}>
                        Xem thêm<span className="ml-2 ti-arrow-right" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomeBlogItem;
