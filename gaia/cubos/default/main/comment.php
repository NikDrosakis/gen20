    <style>
        .comment-widget {
            width: 100%;
            float:left;
            margin: auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .comment-input-box {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        .comment-input-box img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
        }

        .comment-input-box textarea {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            resize: vertical;
            font-size: 1rem;
        }

        .comment-input-box .submit-comment {
            margin-top: 10px;
            padding: 8px 16px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .submit-comment:hover {
            background-color: #0056b3;
        }

        .comment {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .comment img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
        }

        .comment-content {
            flex: 1;
        }

        .comment-content .comment-author {
            font-weight: bold;
        }

        .comment-content .comment-datetime {
            color: #777;
            font-size: 0.9rem;
        }

        .comment-content .comment-text {
            margin-top: 5px;
            font-size: 1rem;
            line-height: 1.4;
        }

        .comment-content .reply-button {
            margin-top: 10px;
            cursor: pointer;
            color: #007bff;
            background: none;
            border: none;
            font-size: 0.9rem;
            padding: 0;
        }

        .reply-button:hover {
            text-decoration: underline;
        }

        .reply-box {
            margin-left: 65px;
            margin-top: 10px;
            display: none; /* Hidden by default */
        }

        .reply-box textarea {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            resize: vertical;
            font-size: 1rem;
        }

        .reply-box .submit-reply {
            margin-top: 10px;
            padding: 8px 16px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .reply-box .submit-reply:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

<div class="comment-widget">

    <!-- Comment Input Box -->
    <div class="comment-input-box">
        <img src="<?=$cms->img?>" alt="User">
        <textarea rows="3" id="comment0" placeholder="Write a comment..."></textarea>
    </div>
    <button class="submit-comment" reply_id=0 id="sent_comment0">Submit Comment</button>

    <div id="commentContainer">
<?php
$comments=$vl->getComments();
if(!empty($comments)){
    for($i=0;$i<count($comments);$i++){
?>
        <!-- Comment 1 -->
        <div class="comment" id="commentBox<?=$comments[$i]['id']?>">
            <img src="/media/<?=$comments[$i]['img']?>" alt="User">
            <div class="comment-content">
                <div class="comment-author"><?=$comments[$i]['fullname']?></div>
                <div class="comment-datetime"><?=date("F j, Y, H:i",$comments[$i]['created'])?></div>
                <div class="comment-text"><?=$comments[$i]['content']?></div>
                <!-- Reply Box -->
                <?php if($comments[$i]['uid']!=$cms->me){ ?>
                    <button class="reply-button">Reply</button>
                <div class="reply-box">
                    <textarea rows="3" id="comment<?=$comments[$i]['id']?>"  placeholder="Write your reply..."></textarea>
                    <button class="submit-reply" reply_id=<?=$comments[$i]['id']?> id="sent_comment<?=$comments[$i]['id']?>">Submit Reply</button>
                </div>
                <?php } ?>
            </div>
        </div>
        <!-- ReplyBox-->
        <div id="replyBox<?=$comments[$i]['id']?>">
        <?php    if($comments[$i]['replies']!=false){
            $replies=$comments[$i]['replies'];
            for($j=0;$j<count($replies);$j++){
        ?>
            <div class="comment" style="margin-left: 65px;">
                <img src="/media/<?=$replies[$j]['img']?>" alt="User">
                <div class="comment-content">
                    <div class="comment-author"><?=$replies[$j]['fullname']?></div>
                    <div class="comment-datetime"><?=date("F j, Y, H:i",$replies[$j]['created'])?></div>
                    <div class="comment-text"><?=$replies[$j]['content']?></div>

                <?php if($replies[$j]['uid']!=$cms->me){ ?>
                    <button class="reply-button">Reply</button>
                    <!-- Reply Box -->
                    <div class="reply-box">
                        <textarea rows="3" id="comment<?=$comments[$i]['id']?>_<?=$replies[$j]['id']?>" placeholder="Write your reply..."></textarea>
                        <button class="submit-reply" reply_id=<?=$comments[$i]['id']?> id="sent_comment<?=$comments[$i]['id']?>_<?=$replies[$j]['id']?>">Submit Reply</button>
                    </div>
                <?php } ?>
            </div>
            </div>
    <?php }} ?>
        </div>
    <?php }} ?>
</div>
</div>

<script>
    document.querySelectorAll('.reply-button').forEach(button => {
        button.addEventListener('click', function() {
            const replyBox = this.nextElementSibling;
            replyBox.style.display = replyBox.style.display === 'block' ? 'none' : 'block';
        });
    });
    $(document)
        .on("click",".submit-comment,.submit-reply",async function(){
            var commentid=$(this).attr('reply_id');
            var textareaid=this.id.replace('sent_','');
            var content= $('#'+textareaid).val();
            const params={a:"comment",content:content,reply_id:commentid,type:'book',typeid:G.id,userid:coo('GSID'),created:time()};
            const savecomment=s.api.maria.inse("comment",params);
            if(savecomment && savecomment.success){
            $('#'+textareaid).val('');
            if(params.reply_id==0) {
                var html = `<div class="comment" id="commentBox${res}"><img src="/media/${G.my.img}" alt="User"><div class="comment-content"><div class="comment-author">${G.my.fullname}</div><div class="comment-datetime">${date("F j, Y, H:i", params.created)}</div><div class="comment-text">${content}</div>`;
                $('#commentContainer').prepend(html);
            }else{
                var html=`<div class="comment" style="margin-left: 65px;"><img src="/media/${G.my.img}" alt="User"><div class="comment-content"><div class="comment-author">${G.my.fullname}</div><div class="comment-datetime">${date("F j, Y, H:i",params.created)}?></div><div class="comment-text">${content}</div>`
                $('#replyBox'+params.reply_id).prepend(html);
                $(this).parent().css('display','none');
            }
            }
        })
</script>

