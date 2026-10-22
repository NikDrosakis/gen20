import React, {useEffect, useState} from 'react';
import DB from "../contexts/DB";
import EditButton from "../modules/EditButton";
import NewButton from "../modules/NewButton";
const MdSection = ({path}) => {
    const [blocks, setBlocks] = useState([]); // array of blocks
    const [postid, setPostid] = useState(1);
    useEffect(() => {
        const fetchPostAndBlocks = async () => {
            // Get post ID
            const postQuery = `SELECT id FROM gen_gen20net.post WHERE name = '${path}'`;
            const result = await DB.maria("f", postQuery);
            if (result?.id) setPostid(result.id);

            // Get blocks
            const data = await DB.maria(path, 'b.sort asc');
            if (data?.length) setBlocks(data);
        };

        fetchPostAndBlocks();
    }, [path]);


    return (
        <div className="blog-details spad">
            <div className="container">
                <div className="row d-flex justify-content-center">
                    <div className="col-lg-8">
                        <div className="blog__details__content">
                            <div className="blog__details__text">
                                {blocks.map(block => (
                                    <div key={block.id} style={{marginBottom: 16}}>
                                        <div
                                            id={`block-${block.id}`}
                                            data-block-id={block.id}   // ← αυτό χρειάζεται
                                            data-row="content"          // ← αυτό χρειάζεται
                                            style={{fontSize: '1.5em'}}
                                            dangerouslySetInnerHTML={{__html: block.content}}
                                        ></div>
                                        <EditButton
                                            blockId={block.id}
                                            uri="ai-guide"
                                            row="content"
                                            editable={true}
                                            lang="el"
                                        />
                                    </div>
                                ))}
                                <NewButton postid={postid} row="content" lang="el"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MdSection;