import React from 'react';
import {ButtonsModal} from "../buttons-form-modal/buttons-modal";
import {ModalIpa} from "../modal/modal.component";

function ConfirmActions({FormOnSubmit, open, onClose, title}) {
    return (
        <ModalIpa open={open} title={title} onClose={onClose}>
            <form onSubmit={FormOnSubmit}>
                <ButtonsModal
                    textSubmit={"تایید"}
                    textClose={"انصراف"}
                    onClose={onClose}
                />
            </form>
        </ModalIpa>
    );
}

export default ConfirmActions;