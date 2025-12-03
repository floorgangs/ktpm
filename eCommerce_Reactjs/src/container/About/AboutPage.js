import React from 'react';
import './AboutPage.scss';

const AboutPage = () => {
    return (
        <div className="about-page">
            {/* Banner Section */}
            <section className="about-banner">
                <div className="banner-overlay">
                    <div className="container">
                        <h1 className="banner-title">EISER - KHƠI NGUỒN CẢM HỨNG, ĐỊNH HÌNH PHONG CÁCH</h1>
                        <p className="banner-subtitle">Nơi thời trang gặp gỡ cá tính</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container about-content">
                {/* Our Story */}
                <section className="about-section story-section">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="section-image">
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" alt="Our Story" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="section-content">
                                <h2 className="section-title">Câu Chuyện Của Chúng Tôi</h2>
                                <div className="title-underline"></div>
                                <p className="section-text">
                                    Mọi hành trình lớn đều bắt đầu từ những bước chân nhỏ bé. <strong>EISER</strong> được thành lập vào năm 2020 với một niềm đam mê đơn thuần nhưng mãnh liệt dành cho thời trang.
                                </p>
                                <p className="section-text">
                                    Chúng tôi khởi đầu không phải là một cửa hàng lộng lẫy, mà từ những trăn trở: "Làm sao để tìm được những bộ trang phục vừa vặn, chất liệu tốt nhưng giá cả vẫn phải chăng?" và "Làm sao để mỗi bộ đồ khoác lên người không chỉ để che chắn, mà còn là tiếng nói của cá tính?".
                                </p>
                                <p className="section-text">
                                    Từ những trăn trở đó, <strong>EISER</strong> ra đời. Chúng tôi không chỉ bán quần áo, chúng tôi kể câu chuyện về cái đẹp, về sự tự tin và về phong cách sống hiện đại. Trải qua thời gian phát triển, từ một shop online nhỏ, nay chúng tôi tự hào là địa chỉ tin cậy của hàng ngàn khách hàng yêu cái đẹp.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="about-section vision-section">
                    <div className="row align-items-center">
                        <div className="col-lg-6 order-lg-2">
                            <div className="section-image">
                                <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800" alt="Vision" />
                            </div>
                        </div>
                        <div className="col-lg-6 order-lg-1">
                            <div className="section-content">
                                <h2 className="section-title">Tầm Nhìn & Sứ Mệnh</h2>
                                <div className="title-underline"></div>
                                <div className="mission-box">
                                    <h3 className="box-title">Tầm nhìn</h3>
                                    <p className="section-text">
                                        <strong>EISER</strong> định hướng trở thành thương hiệu thời trang hàng đầu, là nơi đầu tiên khách hàng nghĩ đến khi muốn làm mới bản thân. Chúng tôi khao khát mang thời trang Việt vươn tầm, nơi chất lượng và thẩm mỹ luôn song hành.
                                    </p>
                                </div>
                                <div className="mission-box">
                                    <h3 className="box-title">Sứ mệnh</h3>
                                    <p className="section-text">
                                        Sứ mệnh của chúng tôi là <strong>"Đánh thức vẻ đẹp tiềm ẩn"</strong>. Chúng tôi tin rằng bất kỳ ai, dù vóc dáng ra sao, đều xứng đáng được tỏa sáng. Mỗi sản phẩm của <strong>EISER</strong> là một công cụ giúp bạn tự tin hơn, yêu đời hơn và thành công hơn trong cuộc sống.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Philosophy */}
                <section className="about-section philosophy-section">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Triết Lý Sản Phẩm</h2>
                        <div className="title-underline mx-auto"></div>
                        <p className="section-intro">
                            Tại <strong>ECOM</strong>, chúng tôi nói KHÔNG với thời trang "nhanh - ẩu". Quy trình tạo ra một sản phẩm của chúng tôi tuân thủ 3 nguyên tắc vàng:
                        </p>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="philosophy-card">
                                <div className="card-icon">
                                    <i className="fas fa-gem"></i>
                                </div>
                                <h3 className="card-title">Chất liệu là linh hồn</h3>
                                <p className="card-text">
                                    Chúng tôi ưu tiên các loại vải thân thiện với làn da, có độ bền cao, thoáng mát và giữ form dáng tốt qua nhiều lần giặt.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="philosophy-card">
                                <div className="card-icon">
                                    <i className="fas fa-drafting-compass"></i>
                                </div>
                                <h3 className="card-title">Thiết kế tôn dáng</h3>
                                <p className="card-text">
                                    Các mẫu mã được nghiên cứu kỹ lưỡng dựa trên đặc điểm hình thể của người Việt, giúp che khuyết điểm và tôn lên những đường nét đẹp nhất.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="philosophy-card">
                                <div className="card-icon">
                                    <i className="fas fa-check-double"></i>
                                </div>
                                <h3 className="card-title">Tỉ mỉ từng chi tiết</h3>
                                <p className="card-text">
                                    Từ đường kim, mũi chỉ, cúc áo cho đến bao bì đóng gói đều được kiểm tra nghiêm ngặt trước khi đến tay khách hàng.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="about-section values-section">
                    <div className="text-center mb-5">
                        <h2 className="section-title">Giá Trị Cốt Lõi</h2>
                        <div className="title-underline mx-auto"></div>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fas fa-heart"></i>
                                </div>
                                <h3 className="value-title">Tận tâm</h3>
                                <p className="value-text">
                                    Khách hàng là trung tâm. Chúng tôi lắng nghe, thấu hiểu và phục vụ khách hàng bằng cả trái tim.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fas fa-lightbulb"></i>
                                </div>
                                <h3 className="value-title">Sáng tạo</h3>
                                <p className="value-text">
                                    Thời trang là sự thay đổi không ngừng. Chúng tôi luôn cập nhật các xu hướng mới nhất của thế giới để mang về những thiết kế thời thượng.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 mb-4">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fas fa-handshake"></i>
                                </div>
                                <h3 className="value-title">Trung thực</h3>
                                <p className="value-text">
                                    Chúng tôi cam kết hình ảnh sản phẩm là thực tế, thông tin mô tả chính xác và minh bạch trong mọi chính sách bán hàng.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Commitment */}
                <section className="about-section commitment-section">
                    <div className="commitment-box">
                        <h2 className="section-title text-center">Cam Kết Của EISER</h2>
                        <div className="title-underline mx-auto"></div>
                        <p className="commitment-intro">
                            Khi mua sắm tại <strong>EISER</strong>, bạn không chỉ mua một món đồ, bạn mua sự an tâm.
                        </p>
                        <div className="row mt-4">
                            <div className="col-lg-4 col-md-6 mb-3">
                                <div className="commitment-item">
                                    <i className="fas fa-headset"></i>
                                    <span>Hỗ trợ tư vấn size và kiểu dáng 24/7</span>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-3">
                                <div className="commitment-item">
                                    <i className="fas fa-undo-alt"></i>
                                    <span>Chính sách đổi trả linh hoạt trong vòng 7 ngày</span>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-3">
                                <div className="commitment-item">
                                    <i className="fas fa-shipping-fast"></i>
                                    <span>Giao hàng nhanh chóng trên toàn quốc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Closing Message */}
                <section className="about-section closing-section">
                    <div className="text-center">
                        <h3 className="closing-title">Cảm ơn bạn đã trở thành một phần trong câu chuyện của chúng tôi</h3>
                        <p className="closing-text">
                            Hãy để <strong>EISER</strong> đồng hành cùng bạn trên hành trình chinh phục phong cách riêng!
                        </p>
                        <a href="/shop" className="btn-shop-now">Khám phá cửa hàng</a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
