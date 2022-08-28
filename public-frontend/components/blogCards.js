import Image from "next/image";
import image from "../public/sunset.jpg";
import {RiFlag2Line} from "react-icons/ri";
import {useRouter} from "next/router";


function BlogCard ({ title, description, id }) {
    const Router = useRouter();
    console.log(id)
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg border cursor-pointer" onClick={() => Router.push({
            pathname: "/blogs/blogPost",
            query:{id: id}
        })}>
            <div className="rounded-lg px-6 py-4" ><Image className="rounded-lg" src={image} alt="Sunset in the mountains"  height="150" width="300"/></div>
            {/* <Image className="w-full" src="/public/sunset.jpg" alt="Sunset in the mountains" layout={'fill'} /> */}
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2 h-[60px]">
                    <text className="line-clamp-2">
                        {title}
                    </text>
                </div>
                <p className="text-gray-700 text-base">
                    {description}
                </p>
            </div>

            <div className="px-6 pt-4 pb-2 flex space-between">
            <div className="rounded-md flex-grow">
            <div className="border-2 w-fit">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                    Keep Reading
                </span>
            </div>

            </div>
            <div className="items-center">
                <RiFlag2Line className="text-gray-700 text-lg" />
            </div>

            </div>
        </div>
    )
}

export default BlogCard;
