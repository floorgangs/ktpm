import React from 'react';

function ProfileProduct(props) {
    const data = props.data || {};
    const renderValue = (value) => {
        if (value === 0) return 0;
        return value || 'Đang cập nhật';
    };
    return (
        <div className="table-responsive">
            <table className="table">
                <tbody>
                    <tr>
                        <td>
                            <h5>Chiều rộng</h5>
                        </td>
                        <td>
                            <h5>{renderValue(data.width)}</h5>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h5>Chiều dài</h5>
                        </td>
                        <td>
                            <h5>{renderValue(data.height)}</h5>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h5>Khối lượng</h5>
                        </td>
                        <td>
                            <h5>{renderValue(data.weight)}</h5>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h5>Kiểm tra chất lượng</h5>
                        </td>
                        <td>
                            <h5>có</h5>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h5>Bảo hành</h5>
                        </td>
                        <td>
                            <h5>có</h5>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ProfileProduct;