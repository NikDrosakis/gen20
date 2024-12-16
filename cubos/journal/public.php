<style>
      h3, h4, h5 {
            margin: 0.5em 0; /* Consistent margin for headings */
            font-weight: bold; /* Emphasize headings */
        }

        p {
            margin: 0.5em 0; /* Small margins for paragraphs */
            font-size: 14px; /* Base font size */
            line-height: 1.5; /* Slightly increased line height for paragraphs */
        }

        /* item Styles */
        .item {
            background-color: #fff; /* White background for items */
            border: 1px solid #ddd; /* Subtle border for separation */
            border-radius: 4px; /* Rounded corners */
            padding: 10px; /* Padding for spacing */
            margin: 15px 0; /* Space between items */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
        }

        .item-media {
            margin-bottom: 10px; /* Space below images */
        }

        .item img {
            max-width: 100%; /* Responsive images */
            border-radius: 4px; /* Rounded corners on images */
        }

        /* Specific item Types */
        .SmallImage, .SmallImageDetail, .SmallImageFacts {
            font-size: 14px; /* Smaller font size for smaller images */
        }

        .LargeImage {
            font-size: 18px; /* Larger font size for larger images */
        }

        .item-title {
            font-size: 16px; /* Default title size */
            color: #000; /* Black for titles */
        }

        .item-subtitle {
            font-size: 14px; /* Slightly smaller subtitle size */
            color: #555; /* Dark grey for subtitles */
        }

        .item-date {
            font-size: 12px; /* Smaller date size */
            color: #777; /* Light grey for date */
            margin-bottom: 5px; /* Space below the date */
        }

        .item-summary, .item-quote {
            font-size: 14px; /* Summary and quote text */
            line-height: 1.4; /* Compact line height for summaries */
        }

        .item-facts {
            list-style-type: none; /* Remove bullet points */
            padding: 0; /* Remove padding */
            margin: 0; /* Remove margin */
        }

        .item-facts li {
            background: #f0f0f0; /* Light grey background for facts */
            border-radius: 4px; /* Rounded corners */
            padding: 5px; /* Padding for spacing */
            margin-bottom: 5px; /* Space between facts */
        }

        /* Blockquote Styles */
        .item-quote {
            font-style: italic; /* Italic for emphasis */
            border-left: 3px solid #ddd; /* Left border for quotes */
            padding-left: 10px; /* Space from the border */
            margin: 10px 0; /* Margin around blockquote */
        }

        /* Gallery Styles */
        .item-gallery {
            display: flex; /* Flexbox for gallery layout */
            gap: 10px; /* Space between images */
        }

        .Gallery-img {
            flex: 1; /* Equal space for images */
            max-width: 100%; /* Responsive images */
            border-radius: 4px; /* Rounded corners on images */
        }

        /* Recommendations */
        .item-recommendations {
            padding-left: 20px; /* Indentation for list */
        }

        /* Opinion Styles */
        .item-author {
            font-size: 12px; /* Smaller font size for authors */
            color: #555; /* Dark grey for author names */
            margin-top: 5px; /* Space above author names */
        }

        /* Event Styles */
        .Event {
            background-color: #e6f7ff; /* Light blue background for events */
            border-left: 3px solid #007bff; /* Blue left border for emphasis */
            padding: 10px; /* Padding for event box */
        }
    </style>
<div id="output">
    <?php
    $cubo=$this->db->f("SELECT id,query from cubo where name=?",["journal"]);

    //$query= json_decode($cubo['query'],true);
    $templates= $this->db->flist("select name,template from cubo_template where cuboid=?",[$cubo['id']]);

   // echo $this->buildTemplateArchive($main);
   $posts = $this->db->fa("select post.* from post LEFT JOIN postgrp on postgrp.id=post.postgrpid where postgrp.name=?",['journal']);
    foreach ($posts as $key => $value) {

   // xecho($templates[$value['type']]);
        //echo $this->buildTemplateArchive($templates[$value['type']],$value);
        echo $this->renderTemplatePug(CUBO_ROOT.'journal/template.pug',$value);
    }
    ?>
</div>