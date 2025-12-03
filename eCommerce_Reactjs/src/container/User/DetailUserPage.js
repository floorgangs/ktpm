import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from '../../component/input/DatePicker';
import moment from 'moment'
import { getDetailUserById, UpdateUserService, handleSendVerifyEmail } from '../../services/userService';
import { useFetchAllcode } from '../customize/fetch';
import CommonUtils from '../../utils/CommonUtils';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './DetailUserPage.scss';

function DetailUserPage() {
    const { id } = useParams();
    const { data: dataGender } = useFetchAllcode('GENDER')
    const [birthday, setbirthday] = useState('');
    const [isChangeDate, setisChangeDate] = useState(false)
    const [inputValues, setInputValues] = useState({
        fullName: '', address: '', phonenumber: '', genderId: '', dob: '', roleId: '', email: '', image: '', isActiveEmail: '', imageReview: '', isOpen: false
    });
    useEffect(() => {

        const fetchUser = async () => {
            let res = await getDetailUserById(id)
            if (res && res.errCode === 0) {
                const data = res.data;
                setInputValues((prev) => ({
                    ...prev,
                    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                    address: data.address,
                    phonenumber: data.phonenumber,
                    genderId: data.genderId,
                    roleId: data.roleId,
                    email: data.email,
                    id: data.id,
                    dob: data.dob,
                    image: data.image ? data.image : "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg",
                    isActiveEmail: data.isActiveEmail
                }));

                if (data.dob && data.dob !== '' && data.dob !== '0') {
                    setbirthday(moment.unix(+data.dob / 1000).locale('vi').format('DD/MM/YYYY'))
                } else {
                    setbirthday('')
                }
            }
        }
        fetchUser();

    }, [id])
    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues({ ...inputValues, [name]: value });
    };
    let handleOnChangeDatePicker = (date) => {
        setbirthday(date[0])
        setisChangeDate(true)
    }
    let handleSaveInfor = async () => {
        // split fullName: first token -> firstName, rest -> lastName
        const nameParts = (inputValues.fullName || '').trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts.length > 0 ? nameParts[0] : '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        let res = await UpdateUserService({
            id: id,
            firstName: firstName,
            lastName: lastName,
            roleId: inputValues.roleId,
            genderId: inputValues.genderId,
            phonenumber: inputValues.phonenumber,
            dob: isChangeDate === false ? inputValues.dob : new Date(birthday).getTime(),
            image: inputValues.image
        })
        if (res && res.errCode === 0) {
            toast.success("Cập nhật người dùng thành công")
            // Reload lại thông tin user để hiển thị địa chỉ mới
            const updatedUser = await getDetailUserById(id)
            if (updatedUser && updatedUser.errCode === 0) {
                setInputValues((prev) => ({
                    ...prev,
                    fullName: `${updatedUser.data.firstName || ''} ${updatedUser.data.lastName || ''}`.trim(),
                    // keep address out of personal info form (we manage addresses elsewhere)
                }))
            }
        } else {
            toast.error(res.errMessage)
        }
    }
    let handleSendEmail = async () => {
        let res = await handleSendVerifyEmail({
            id: id
        })
        if (res && res.errCode === 0) {
            toast.success("Vui lòng kiểm tra email !")
        } else {
            toast.error(res.errMessage)
        }
    }
    let handleOnChangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file.size > 31312281) {
            toast.error("Dung lượng file bé hơn 30mb")
        }
        else {
            let base64 = await CommonUtils.getBase64(file);
            let objectUrl = URL.createObjectURL(file)
            setInputValues((prev) => ({ ...prev, image: base64, imageReview: objectUrl }))

        }
    }
    let openPreviewImage = (url) => {


        setInputValues((prev) => ({
            ...prev,
            isOpen: true,
            imageReview: url
        }))

    }
    return (
        <div className="container rounded bg-white mt-5 mb-5">
            <div className="row">
                <div className="col-md-3 border-right">
                        <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                        <img onClick={() => openPreviewImage(inputValues.image)} className="rounded-circle mt-5" height="170px" style={{ objectFit: "cover", cursor: 'pointer' }} width="150px" src={inputValues.image} alt="user" />
                        <span className="fw-bold">{inputValues.fullName || inputValues.email}</span>
                        <div className="box-email-verify">
                            <span className="text-black-50">{inputValues.email}
                            </span>
                            {inputValues.isActiveEmail === 0 &&
                                <i style={{ color: '#dc0707' }} className="fas fa-times-circle"></i>
                            }
                            {inputValues.isActiveEmail === 1 &&
                                <i style={{ color: 'green' }} className="fas fa-check-circle"></i>
                            }
                        </div>

                        {inputValues.isActiveEmail === 0 &&
                            <span onClick={() => handleSendEmail()} className="text-verify">xác thực</span>
                        }

                    </div>
                </div>
                <div className="col-md-9 border-right">
                    <div className="p-3 py-5">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="text-end">Thông tin cá nhân</h4>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-12">
                                <label className="labels">Họ và Tên <span style={{color: '#dc3545'}}>*</span></label>
                                <div>
                                    <input name="fullName" onChange={(event) => handleOnChange(event)} value={inputValues.fullName} type="text" className="form-control" placeholder="Họ và tên (VD: Nguyễn Văn A)" />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-12"><label className="labels">Số điện thoại <span style={{color: '#dc3545'}}>*</span></label><input name="phonenumber" onChange={(event) => handleOnChange(event)} type="text" className="form-control" value={inputValues.phonenumber} placeholder="Nhập số điện thoại" /></div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-6"><label className="labels">Giới tính</label><select value={inputValues.genderId} name="genderId" onChange={(event) => handleOnChange(event)} id="inputState" className="form-control">
                                <option value="">-- Chọn giới tính --</option>
                                {dataGender && dataGender.length > 0 &&
                                    dataGender.map((item, index) => {
                                        return (
                                            <option key={index} value={item.code}>{item.value}</option>
                                        )
                                    })
                                }
                            </select></div>
                            <div className="col-md-6"><label className="labels">Ngày sinh</label> <DatePicker className="form-control" onChange={handleOnChangeDatePicker}
                                value={birthday}
                                placeholder="Chọn ngày sinh"
                            /></div>
                        </div>
                        {/* Address moved to separate Address management UI (AddressUser) */}
                        <div className="row mt-2">
                            <div className="col-md-3">
                                <label className="labels">Chọn ảnh</label>
                                <input type="file" id="previewImg" accept=".jpg,.png"
                                    hidden onChange={(event) => handleOnChangeImage(event)}
                                />
                                <label style={{ backgroundColor: '#eee', borderRadius: '5px', padding: '6px', cursor: 'pointer' }} className="label-upload" htmlFor="previewImg"

                                >Tải ảnh <i className="fas fa-upload"></i></label>

                            </div>
                        </div>
                        <div onClick={() => handleSaveInfor()} className="mt-5 text-center"><button className="btn btn-primary profile-button" type="button">Lưu thông tin</button></div>
                    </div>
                </div>

            </div>
            {
                inputValues.isOpen === true &&
                <Lightbox 
                    open={inputValues.isOpen}
                    close={() => setInputValues((prev) => ({ ...prev, isOpen: false }))}
                    slides={[{ src: inputValues.imageReview }]}
                />
            }
        </div >



    );
}

export default DetailUserPage;