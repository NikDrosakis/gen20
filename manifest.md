manifest:
    filemeta:
        @[table.field]: "table.field content (strictly this style) inside <!--  --> or /**  */"
        filemeta.script: "filemeta.script"
        filemeta.css: "save/update/bundle to filemeta.css starting <style> endofcontent </style>"
        filemeta.head: "filemeta.head starting <head> endofcontent </head>"
        @cron: "create/update cron"
        @filemeta.description: "update filemeta.description"
        @filemeta.todo: "update filemeta.todo"
        @filemeta.features: "update filemeta.features"
        @filemeta.doc: "update filemeta.doc"
    
    filemetacore:
        @filemetacore.description: "update filemetacore.description"
        @filemetacore.todo: "update filemetacore.todo"
        @filemetacore.features: "update filemetacore.features"
        @filemetacore.doc: "update filemetacore.doc"
    
    format-content:
        readonly: "set not edited"
        img: "set <img>"
        img-icon: "set <img> for icon library"
        img-photo: "set <img> for user photo library"
        img-graph: "set <img> for Graph creation"
        meta: "comma separated words (replace with comma)"
        comma: "comma separated words"
        twig: "set twig editor by Form/Template (replace with pug)"
        pug: "set pug editor by Form/Template"
        sql: "read as sql by Form/Template"
        selectjoin-[table].name: "read from Form as joined with other table"
        selectG-[key]: "read as $this->G[key] (replace with ENUM)"
        auto: "read as primary key (mostly id, not edit) (deprecated, not used, delete it)"
        boolean: "read as checkbox boolean or FALSE/TRUE NO/YES 0/1 (διακόπτης)"
        json: "read and decoded as json"
        exe: "render button for execution, execute straight code (replaced with js, php, the lang executed)"
        loc: "localized textarea used by Lang for translation"
        cron: "varchar in cron format to be executed by Action converted to linux cron or sql event"
    
    folders:
        cubos: "folder with cubos"
        compos: "folder with components"
        main: "admin/folder"
        kronos: null
        ermis: null
        public: null
