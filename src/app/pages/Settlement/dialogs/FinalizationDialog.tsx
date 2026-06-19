import React, { useState } from 'react'
import dayjs from 'dayjs';
import { Button, DatePicker, Flex, Modal } from 'antd';

const FinalizationDialog = ({ handleFinalization, show, onHide }) => {

    const [valueTime, setValueime] = useState<any>();

    const disabledFutureDate = (date) => {
        const unixDate = dayjs(date).unix();
        const today = dayjs()
            .endOf("day")
            .unix();

        return unixDate > today;
    };

    return (
        <Modal
            aria-labelledby="example-modal-sizes-title-lg"
            centered
            open={show}
            footer={[<Flex gap={20} justify='center'>
                <Button onClick={onHide} style={{ height: 40, width: 100, background: '#f3f6f9', color: "black" }}>
                    Hủy bỏ
                </Button>
                <Button disabled={!valueTime}
                    type="primary"
                    onClick={async () => handleFinalization(valueTime)}
                    color="#ff5629"
                    style={{ height: 40, fontSize: 14, width: 100, color: 'white', background: '#ff5629', opacity: !valueTime ? '0.6' : '' }}>
                    Lưu lại
                </Button>
            </Flex>]}
            title={'Chọn thời gian quyết toán'}
        >

            <div className="col-12 mb-6">
                <DatePicker
                    onChange={value => {
                        console.log(value)
                        if (!!value) {
                            setValueime(value)
                        } else {
                            setValueime(null)
                        }

                    }}
                    format={"DD/MM/YYYY HH:mm"}
                    showTime={{ format: 'HH:mm' }}
                    value={valueTime}
                    // disabledDate={disabledFutureDate}
                    placeholder="Chọn thời gian"
                    className="w-100 custome__style__input__date border border-gray"
                />
            </div>
        </Modal>
    )
}

export default FinalizationDialog