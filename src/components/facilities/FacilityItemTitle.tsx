import {FC} from "react";

interface FacilityItemTitleProps {
    imgUrl: string
    itemName: string
    itemCounts: number
}

const FacilityItemTitle: FC<FacilityItemTitleProps> = ({
                                                           imgUrl, itemCounts, itemName
                                                       }) => {
    return (
        <div className={"flex relative"}>
            <img className={""} src={imgUrl} alt=""/>
            <div style={{
                transform: 'translate(-50%,-50%)'
            }} className={"absolute left-1/2 top-1/2 flex justify-center items-center"}>
                <span>{itemName}</span>
                <span className={"text-[28px]"}>{itemCounts}</span>
                <span>个</span>
            </div>
        </div>
    );
}

export default FacilityItemTitle

