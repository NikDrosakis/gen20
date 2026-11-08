.
├── core
│   ├── api.go
│   ├── bind.go
│   ├── build.go
│   ├── couchdb.go
│   ├── exec.go
│   ├── gredis.go
│   ├── hosts.go
│   ├── hub_client.go
│   ├── hub.go
│   ├── mari.go
│   ├── ownership.go
│   ├── ssl.go
│   ├── ws.go
│   └── ws_hub.go
├── cubos
│   ├── aggregator.go
│   ├── chat
│   │   ├── chat.go
│   │   ├── chat_handlers.go
│   │   └── chat_helpers.go
│   ├── manifest.json
│   ├── mermaid
│   │   └── routes.go
│   └── terminal
│       └── terminal.go
├── god
├── god-backup-before-mcp
├── go.mod
├── go.mod.bak
├── go.sum
├── go.sum.bak
├── go_vendor.tar.gz
├── index.html
├── main
├── main.go
├── public
│   └── index.html
├── README.md
├── test
├── tmp
│   ├── action.go
│   ├── build-errors.log
│   └── main
├── tree.md
└── vendor
    ├── filippo.io
    │   └── edwards25519
    │       ├── doc.go
    │       ├── edwards25519.go
    │       ├── extra.go
    │       ├── field
    │       │   ├── fe_amd64.go
    │       │   ├── fe_amd64_noasm.go
    │       │   ├── fe_amd64.s
    │       │   ├── fe_arm64.go
    │       │   ├── fe_arm64_noasm.go
    │       │   ├── fe_arm64.s
    │       │   ├── fe_extra.go
    │       │   ├── fe_generic.go
    │       │   └── fe.go
    │       ├── LICENSE
    │       ├── README.md
    │       ├── scalar_fiat.go
    │       ├── scalar.go
    │       ├── scalarmult.go
    │       └── tables.go
    ├── github.com
    │   ├── bytedance
    │   │   └── sonic
    │   │       ├── api.go
    │   │       ├── ast
    │   │       │   ├── api_compat.go
    │   │       │   ├── api.go
    │   │       │   ├── asm.s
    │   │       │   ├── buffer.go
    │   │       │   ├── decode.go
    │   │       │   ├── encode.go
    │   │       │   ├── error.go
    │   │       │   ├── iterator.go
    │   │       │   ├── node.go
    │   │       │   ├── parser.go
    │   │       │   ├── search.go
    │   │       │   ├── stubs.go
    │   │       │   └── visitor.go
    │   │       ├── CODE_OF_CONDUCT.md
    │   │       ├── compat.go
    │   │       ├── CONTRIBUTING.md
    │   │       ├── CREDITS
    │   │       ├── decoder
    │   │       │   ├── decoder_compat.go
    │   │       │   └── decoder_native.go
    │   │       ├── encoder
    │   │       │   ├── encoder_compat.go
    │   │       │   └── encoder_native.go
    │   │       ├── go.work
    │   │       ├── go.work.sum
    │   │       ├── internal
    │   │       │   ├── base64
    │   │       │   │   ├── b64_amd64.go
    │   │       │   │   └── b64_compat.go
    │   │       │   ├── caching
    │   │       │   │   ├── asm.s
    │   │       │   │   ├── fcache.go
    │   │       │   │   ├── hashing.go
    │   │       │   │   └── pcache.go
    │   │       │   ├── cpu
    │   │       │   │   └── features.go
    │   │       │   ├── decoder
    │   │       │   │   ├── api
    │   │       │   │   │   ├── decoder_amd64.go
    │   │       │   │   │   ├── decoder_arm64.go
    │   │       │   │   │   ├── decoder.go
    │   │       │   │   │   └── stream.go
    │   │       │   │   ├── consts
    │   │       │   │   │   └── option.go
    │   │       │   │   ├── errors
    │   │       │   │   │   └── errors.go
    │   │       │   │   ├── jitdec
    │   │       │   │   │   ├── asm.s
    │   │       │   │   │   ├── asm_stubs_amd64_go117.go
    │   │       │   │   │   ├── asm_stubs_amd64_go121.go
    │   │       │   │   │   ├── assembler_regabi_amd64.go
    │   │       │   │   │   ├── compiler.go
    │   │       │   │   │   ├── debug.go
    │   │       │   │   │   ├── decoder.go
    │   │       │   │   │   ├── generic_regabi_amd64.go
    │   │       │   │   │   ├── generic_regabi_amd64_test.s
    │   │       │   │   │   ├── pools.go
    │   │       │   │   │   ├── primitives.go
    │   │       │   │   │   ├── stubs_go116.go
    │   │       │   │   │   ├── stubs_go120.go
    │   │       │   │   │   ├── types.go
    │   │       │   │   │   └── utils.go
    │   │       │   │   └── optdec
    │   │       │   │       ├── compiler.go
    │   │       │   │       ├── compile_struct.go
    │   │       │   │       ├── const.go
    │   │       │   │       ├── context.go
    │   │       │   │       ├── decoder.go
    │   │       │   │       ├── errors.go
    │   │       │   │       ├── functor.go
    │   │       │   │       ├── helper.go
    │   │       │   │       ├── interface.go
    │   │       │   │       ├── map.go
    │   │       │   │       ├── native.go
    │   │       │   │       ├── node.go
    │   │       │   │       ├── slice.go
    │   │       │   │       ├── stringopts.go
    │   │       │   │       ├── structs.go
    │   │       │   │       └── types.go
    │   │       │   ├── encoder
    │   │       │   │   ├── alg
    │   │       │   │   │   ├── mapiter.go
    │   │       │   │   │   ├── opts.go
    │   │       │   │   │   ├── primitives.go
    │   │       │   │   │   ├── sort.go
    │   │       │   │   │   ├── spec_compat.go
    │   │       │   │   │   └── spec.go
    │   │       │   │   ├── compiler.go
    │   │       │   │   ├── encode_norace.go
    │   │       │   │   ├── encode_race.go
    │   │       │   │   ├── encoder.go
    │   │       │   │   ├── ir
    │   │       │   │   │   └── op.go
    │   │       │   │   ├── pools_amd64.go
    │   │       │   │   ├── pools_compt.go
    │   │       │   │   ├── stream.go
    │   │       │   │   ├── vars
    │   │       │   │   │   ├── cache.go
    │   │       │   │   │   ├── const.go
    │   │       │   │   │   ├── errors.go
    │   │       │   │   │   ├── stack.go
    │   │       │   │   │   └── types.go
    │   │       │   │   ├── vm
    │   │       │   │   │   ├── stbus.go
    │   │       │   │   │   └── vm.go
    │   │       │   │   └── x86
    │   │       │   │       ├── asm_stubs_amd64_go117.go
    │   │       │   │       ├── asm_stubs_amd64_go121.go
    │   │       │   │       ├── assembler_regabi_amd64.go
    │   │       │   │       ├── debug_go116.go
    │   │       │   │       ├── debug_go117.go
    │   │       │   │       └── stbus.go
    │   │       │   ├── envs
    │   │       │   │   └── decode.go
    │   │       │   ├── jit
    │   │       │   │   ├── arch_amd64.go
    │   │       │   │   ├── asm.s
    │   │       │   │   ├── assembler_amd64.go
    │   │       │   │   ├── backend.go
    │   │       │   │   └── runtime.go
    │   │       │   ├── native
    │   │       │   │   ├── avx2
    │   │       │   │   │   ├── f32toa.go
    │   │       │   │   │   ├── f32toa_subr.go
    │   │       │   │   │   ├── f32toa_text_amd64.go
    │   │       │   │   │   ├── f64toa.go
    │   │       │   │   │   ├── f64toa_subr.go
    │   │       │   │   │   ├── f64toa_text_amd64.go
    │   │       │   │   │   ├── get_by_path.go
    │   │       │   │   │   ├── get_by_path_subr.go
    │   │       │   │   │   ├── get_by_path_text_amd64.go
    │   │       │   │   │   ├── html_escape.go
    │   │       │   │   │   ├── html_escape_subr.go
    │   │       │   │   │   ├── html_escape_text_amd64.go
    │   │       │   │   │   ├── i64toa.go
    │   │       │   │   │   ├── i64toa_subr.go
    │   │       │   │   │   ├── i64toa_text_amd64.go
    │   │       │   │   │   ├── lookup_small_key.go
    │   │       │   │   │   ├── lookup_small_key_subr.go
    │   │       │   │   │   ├── lookup_small_key_text_amd64.go
    │   │       │   │   │   ├── lspace.go
    │   │       │   │   │   ├── lspace_subr.go
    │   │       │   │   │   ├── lspace_text_amd64.go
    │   │       │   │   │   ├── native_export.go
    │   │       │   │   │   ├── parse_with_padding.go
    │   │       │   │   │   ├── parse_with_padding_subr.go
    │   │       │   │   │   ├── parse_with_padding_text_amd64.go
    │   │       │   │   │   ├── quote.go
    │   │       │   │   │   ├── quote_subr.go
    │   │       │   │   │   ├── quote_text_amd64.go
    │   │       │   │   │   ├── skip_array.go
    │   │       │   │   │   ├── skip_array_subr.go
    │   │       │   │   │   ├── skip_array_text_amd64.go
    │   │       │   │   │   ├── skip_number.go
    │   │       │   │   │   ├── skip_number_subr.go
    │   │       │   │   │   ├── skip_number_text_amd64.go
    │   │       │   │   │   ├── skip_object.go
    │   │       │   │   │   ├── skip_object_subr.go
    │   │       │   │   │   ├── skip_object_text_amd64.go
    │   │       │   │   │   ├── skip_one_fast.go
    │   │       │   │   │   ├── skip_one_fast_subr.go
    │   │       │   │   │   ├── skip_one_fast_text_amd64.go
    │   │       │   │   │   ├── skip_one.go
    │   │       │   │   │   ├── skip_one_subr.go
    │   │       │   │   │   ├── skip_one_text_amd64.go
    │   │       │   │   │   ├── u64toa.go
    │   │       │   │   │   ├── u64toa_subr.go
    │   │       │   │   │   ├── u64toa_text_amd64.go
    │   │       │   │   │   ├── unquote.go
    │   │       │   │   │   ├── unquote_subr.go
    │   │       │   │   │   ├── unquote_text_amd64.go
    │   │       │   │   │   ├── validate_one.go
    │   │       │   │   │   ├── validate_one_subr.go
    │   │       │   │   │   ├── validate_one_text_amd64.go
    │   │       │   │   │   ├── validate_utf8_fast.go
    │   │       │   │   │   ├── validate_utf8_fast_subr.go
    │   │       │   │   │   ├── validate_utf8_fast_text_amd64.go
    │   │       │   │   │   ├── validate_utf8.go
    │   │       │   │   │   ├── validate_utf8_subr.go
    │   │       │   │   │   ├── validate_utf8_text_amd64.go
    │   │       │   │   │   ├── value.go
    │   │       │   │   │   ├── value_subr.go
    │   │       │   │   │   ├── value_text_amd64.go
    │   │       │   │   │   ├── vnumber.go
    │   │       │   │   │   ├── vnumber_subr.go
    │   │       │   │   │   ├── vnumber_text_amd64.go
    │   │       │   │   │   ├── vsigned.go
    │   │       │   │   │   ├── vsigned_subr.go
    │   │       │   │   │   ├── vsigned_text_amd64.go
    │   │       │   │   │   ├── vstring.go
    │   │       │   │   │   ├── vstring_subr.go
    │   │       │   │   │   ├── vstring_text_amd64.go
    │   │       │   │   │   ├── vunsigned.go
    │   │       │   │   │   ├── vunsigned_subr.go
    │   │       │   │   │   └── vunsigned_text_amd64.go
    │   │       │   │   ├── dispatch_amd64.go
    │   │       │   │   ├── dispatch_arm64.go
    │   │       │   │   ├── f32toa.tmpl
    │   │       │   │   ├── f64toa.tmpl
    │   │       │   │   ├── fastfloat_test.tmpl
    │   │       │   │   ├── fastint_test.tmpl
    │   │       │   │   ├── get_by_path.tmpl
    │   │       │   │   ├── html_escape.tmpl
    │   │       │   │   ├── i64toa.tmpl
    │   │       │   │   ├── lookup_small_key.tmpl
    │   │       │   │   ├── lspace.tmpl
    │   │       │   │   ├── native_export.tmpl
    │   │       │   │   ├── native_test.tmpl
    │   │       │   │   ├── neon
    │   │       │   │   │   ├── f32toa_arm64.go
    │   │       │   │   │   ├── f32toa_arm64.s
    │   │       │   │   │   ├── f32toa_subr_arm64.go
    │   │       │   │   │   ├── f64toa_arm64.go
    │   │       │   │   │   ├── f64toa_arm64.s
    │   │       │   │   │   ├── f64toa_subr_arm64.go
    │   │       │   │   │   ├── get_by_path_arm64.go
    │   │       │   │   │   ├── get_by_path_arm64.s
    │   │       │   │   │   ├── get_by_path_subr_arm64.go
    │   │       │   │   │   ├── html_escape_arm64.go
    │   │       │   │   │   ├── html_escape_arm64.s
    │   │       │   │   │   ├── html_escape_subr_arm64.go
    │   │       │   │   │   ├── i64toa_arm64.go
    │   │       │   │   │   ├── i64toa_arm64.s
    │   │       │   │   │   ├── i64toa_subr_arm64.go
    │   │       │   │   │   ├── lookup_small_key_arm64.go
    │   │       │   │   │   ├── lookup_small_key_arm64.s
    │   │       │   │   │   ├── lookup_small_key_subr_arm64.go
    │   │       │   │   │   ├── lspace_arm64.go
    │   │       │   │   │   ├── lspace_arm64.s
    │   │       │   │   │   ├── lspace_subr_arm64.go
    │   │       │   │   │   ├── native_export_arm64.go
    │   │       │   │   │   ├── parse_with_padding_arm64.go
    │   │       │   │   │   ├── parse_with_padding_arm64.s
    │   │       │   │   │   ├── parse_with_padding_subr_arm64.go
    │   │       │   │   │   ├── quote_arm64.go
    │   │       │   │   │   ├── quote_arm64.s
    │   │       │   │   │   ├── quote_subr_arm64.go
    │   │       │   │   │   ├── skip_array_arm64.go
    │   │       │   │   │   ├── skip_array_arm64.s
    │   │       │   │   │   ├── skip_array_subr_arm64.go
    │   │       │   │   │   ├── skip_number_arm64.go
    │   │       │   │   │   ├── skip_number_arm64.s
    │   │       │   │   │   ├── skip_number_subr_arm64.go
    │   │       │   │   │   ├── skip_object_arm64.go
    │   │       │   │   │   ├── skip_object_arm64.s
    │   │       │   │   │   ├── skip_object_subr_arm64.go
    │   │       │   │   │   ├── skip_one_arm64.go
    │   │       │   │   │   ├── skip_one_arm64.s
    │   │       │   │   │   ├── skip_one_fast_arm64.go
    │   │       │   │   │   ├── skip_one_fast_arm64.s
    │   │       │   │   │   ├── skip_one_fast_subr_arm64.go
    │   │       │   │   │   ├── skip_one_subr_arm64.go
    │   │       │   │   │   ├── u64toa_arm64.go
    │   │       │   │   │   ├── u64toa_arm64.s
    │   │       │   │   │   ├── u64toa_subr_arm64.go
    │   │       │   │   │   ├── unquote_arm64.go
    │   │       │   │   │   ├── unquote_arm64.s
    │   │       │   │   │   ├── unquote_subr_arm64.go
    │   │       │   │   │   ├── validate_one_arm64.go
    │   │       │   │   │   ├── validate_one_arm64.s
    │   │       │   │   │   ├── validate_one_subr_arm64.go
    │   │       │   │   │   ├── validate_utf8_arm64.go
    │   │       │   │   │   ├── validate_utf8_arm64.s
    │   │       │   │   │   ├── validate_utf8_fast_arm64.go
    │   │       │   │   │   ├── validate_utf8_fast_arm64.s
    │   │       │   │   │   ├── validate_utf8_fast_subr_arm64.go
    │   │       │   │   │   ├── validate_utf8_subr_arm64.go
    │   │       │   │   │   ├── value_arm64.go
    │   │       │   │   │   ├── value_arm64.s
    │   │       │   │   │   ├── value_subr_arm64.go
    │   │       │   │   │   ├── vnumber_arm64.go
    │   │       │   │   │   ├── vnumber_arm64.s
    │   │       │   │   │   ├── vnumber_subr_arm64.go
    │   │       │   │   │   ├── vsigned_arm64.go
    │   │       │   │   │   ├── vsigned_arm64.s
    │   │       │   │   │   ├── vsigned_subr_arm64.go
    │   │       │   │   │   ├── vstring_arm64.go
    │   │       │   │   │   ├── vstring_arm64.s
    │   │       │   │   │   ├── vstring_subr_arm64.go
    │   │       │   │   │   ├── vunsigned_arm64.go
    │   │       │   │   │   ├── vunsigned_arm64.s
    │   │       │   │   │   └── vunsigned_subr_arm64.go
    │   │       │   │   ├── parse_with_padding.tmpl
    │   │       │   │   ├── quote.tmpl
    │   │       │   │   ├── recover_test.tmpl
    │   │       │   │   ├── skip_array.tmpl
    │   │       │   │   ├── skip_number.tmpl
    │   │       │   │   ├── skip_object.tmpl
    │   │       │   │   ├── skip_one_fast.tmpl
    │   │       │   │   ├── skip_one.tmpl
    │   │       │   │   ├── sse
    │   │       │   │   │   ├── f32toa.go
    │   │       │   │   │   ├── f32toa_subr.go
    │   │       │   │   │   ├── f32toa_text_amd64.go
    │   │       │   │   │   ├── f64toa.go
    │   │       │   │   │   ├── f64toa_subr.go
    │   │       │   │   │   ├── f64toa_text_amd64.go
    │   │       │   │   │   ├── get_by_path.go
    │   │       │   │   │   ├── get_by_path_subr.go
    │   │       │   │   │   ├── get_by_path_text_amd64.go
    │   │       │   │   │   ├── html_escape.go
    │   │       │   │   │   ├── html_escape_subr.go
    │   │       │   │   │   ├── html_escape_text_amd64.go
    │   │       │   │   │   ├── i64toa.go
    │   │       │   │   │   ├── i64toa_subr.go
    │   │       │   │   │   ├── i64toa_text_amd64.go
    │   │       │   │   │   ├── lookup_small_key.go
    │   │       │   │   │   ├── lookup_small_key_subr.go
    │   │       │   │   │   ├── lookup_small_key_text_amd64.go
    │   │       │   │   │   ├── lspace.go
    │   │       │   │   │   ├── lspace_subr.go
    │   │       │   │   │   ├── lspace_text_amd64.go
    │   │       │   │   │   ├── native_export.go
    │   │       │   │   │   ├── parse_with_padding.go
    │   │       │   │   │   ├── parse_with_padding_subr.go
    │   │       │   │   │   ├── parse_with_padding_text_amd64.go
    │   │       │   │   │   ├── quote.go
    │   │       │   │   │   ├── quote_subr.go
    │   │       │   │   │   ├── quote_text_amd64.go
    │   │       │   │   │   ├── skip_array.go
    │   │       │   │   │   ├── skip_array_subr.go
    │   │       │   │   │   ├── skip_array_text_amd64.go
    │   │       │   │   │   ├── skip_number.go
    │   │       │   │   │   ├── skip_number_subr.go
    │   │       │   │   │   ├── skip_number_text_amd64.go
    │   │       │   │   │   ├── skip_object.go
    │   │       │   │   │   ├── skip_object_subr.go
    │   │       │   │   │   ├── skip_object_text_amd64.go
    │   │       │   │   │   ├── skip_one_fast.go
    │   │       │   │   │   ├── skip_one_fast_subr.go
    │   │       │   │   │   ├── skip_one_fast_text_amd64.go
    │   │       │   │   │   ├── skip_one.go
    │   │       │   │   │   ├── skip_one_subr.go
    │   │       │   │   │   ├── skip_one_text_amd64.go
    │   │       │   │   │   ├── u64toa.go
    │   │       │   │   │   ├── u64toa_subr.go
    │   │       │   │   │   ├── u64toa_text_amd64.go
    │   │       │   │   │   ├── unquote.go
    │   │       │   │   │   ├── unquote_subr.go
    │   │       │   │   │   ├── unquote_text_amd64.go
    │   │       │   │   │   ├── validate_one.go
    │   │       │   │   │   ├── validate_one_subr.go
    │   │       │   │   │   ├── validate_one_text_amd64.go
    │   │       │   │   │   ├── validate_utf8_fast.go
    │   │       │   │   │   ├── validate_utf8_fast_subr.go
    │   │       │   │   │   ├── validate_utf8_fast_text_amd64.go
    │   │       │   │   │   ├── validate_utf8.go
    │   │       │   │   │   ├── validate_utf8_subr.go
    │   │       │   │   │   ├── validate_utf8_text_amd64.go
    │   │       │   │   │   ├── value.go
    │   │       │   │   │   ├── value_subr.go
    │   │       │   │   │   ├── value_text_amd64.go
    │   │       │   │   │   ├── vnumber.go
    │   │       │   │   │   ├── vnumber_subr.go
    │   │       │   │   │   ├── vnumber_text_amd64.go
    │   │       │   │   │   ├── vsigned.go
    │   │       │   │   │   ├── vsigned_subr.go
    │   │       │   │   │   ├── vsigned_text_amd64.go
    │   │       │   │   │   ├── vstring.go
    │   │       │   │   │   ├── vstring_subr.go
    │   │       │   │   │   ├── vstring_text_amd64.go
    │   │       │   │   │   ├── vunsigned.go
    │   │       │   │   │   ├── vunsigned_subr.go
    │   │       │   │   │   └── vunsigned_text_amd64.go
    │   │       │   │   ├── traceback_test.mock_tmpl
    │   │       │   │   ├── types
    │   │       │   │   │   └── types.go
    │   │       │   │   ├── u64toa.tmpl
    │   │       │   │   ├── unquote.tmpl
    │   │       │   │   ├── validate_one.tmpl
    │   │       │   │   ├── validate_utf8_fast.tmpl
    │   │       │   │   ├── validate_utf8.tmpl
    │   │       │   │   ├── value.tmpl
    │   │       │   │   ├── vnumber.tmpl
    │   │       │   │   ├── vsigned.tmpl
    │   │       │   │   ├── vstring.tmpl
    │   │       │   │   └── vunsigned.tmpl
    │   │       │   ├── optcaching
    │   │       │   │   ├── asm.s
    │   │       │   │   └── fcache.go
    │   │       │   ├── resolver
    │   │       │   │   ├── asm.s
    │   │       │   │   ├── resolver.go
    │   │       │   │   ├── stubs_compat.go
    │   │       │   │   └── stubs_latest.go
    │   │       │   ├── rt
    │   │       │   │   ├── asm_amd64.s
    │   │       │   │   ├── asm_compat.s
    │   │       │   │   ├── assertI2I.go
    │   │       │   │   ├── base64_amd64.go
    │   │       │   │   ├── base64_compat.go
    │   │       │   │   ├── fastconv.go
    │   │       │   │   ├── fastmem.go
    │   │       │   │   ├── fastvalue.go
    │   │       │   │   ├── gcwb.go
    │   │       │   │   ├── gcwb_legacy.go
    │   │       │   │   ├── growslice.go
    │   │       │   │   ├── growslice_legacy.go
    │   │       │   │   ├── int48.go
    │   │       │   │   ├── pool.go
    │   │       │   │   ├── stackmap.go
    │   │       │   │   ├── stubs.go
    │   │       │   │   ├── table.go
    │   │       │   │   └── types.go
    │   │       │   └── utils
    │   │       │       └── skip.go
    │   │       ├── LICENSE
    │   │       ├── loader
    │   │       │   ├── funcdata_compat.go
    │   │       │   ├── funcdata.go
    │   │       │   ├── funcdata_go117.go
    │   │       │   ├── funcdata_go118.go
    │   │       │   ├── funcdata_go120.go
    │   │       │   ├── funcdata_go121.go
    │   │       │   ├── funcdata_go123.go
    │   │       │   ├── funcdata_latest.go
    │   │       │   ├── internal
    │   │       │   │   ├── abi
    │   │       │   │   │   ├── abi_amd64.go
    │   │       │   │   │   ├── abi.go
    │   │       │   │   │   ├── abi_legacy_amd64.go
    │   │       │   │   │   ├── abi_regabi_amd64.go
    │   │       │   │   │   └── stubs.go
    │   │       │   │   ├── iasm
    │   │       │   │   │   ├── expr
    │   │       │   │   │   │   ├── ast.go
    │   │       │   │   │   │   ├── errors.go
    │   │       │   │   │   │   ├── ops.go
    │   │       │   │   │   │   ├── parser.go
    │   │       │   │   │   │   ├── pools.go
    │   │       │   │   │   │   ├── term.go
    │   │       │   │   │   │   └── utils.go
    │   │       │   │   │   └── x86_64
    │   │       │   │   │       ├── arch.go
    │   │       │   │   │       ├── asm.s
    │   │       │   │   │       ├── eface.go
    │   │       │   │   │       ├── encodings.go
    │   │       │   │   │       ├── instructions.go
    │   │       │   │   │       ├── instructions_table.go
    │   │       │   │   │       ├── operands.go
    │   │       │   │   │       ├── pools.go
    │   │       │   │   │       ├── program.go
    │   │       │   │   │       ├── registers.go
    │   │       │   │   │       └── utils.go
    │   │       │   │   └── rt
    │   │       │   │       ├── fastmem.go
    │   │       │   │       ├── fastvalue.go
    │   │       │   │       └── stackmap.go
    │   │       │   ├── LICENSE
    │   │       │   ├── loader.go
    │   │       │   ├── loader_latest.go
    │   │       │   ├── mmap_unix.go
    │   │       │   ├── mmap_windows.go
    │   │       │   ├── pcdata.go
    │   │       │   ├── register.go
    │   │       │   ├── register_tango.go
    │   │       │   ├── stubs.go
    │   │       │   └── wrapper.go
    │   │       ├── option
    │   │       │   └── option.go
    │   │       ├── rawmessage.go
    │   │       ├── README.md
    │   │       ├── README_ZH_CN.md
    │   │       ├── sonic.go
    │   │       ├── unquote
    │   │       │   └── unquote.go
    │   │       └── utf8
    │   │           └── utf8.go
    │   ├── cespare
    │   │   └── xxhash
    │   │       └── v2
    │   │           ├── LICENSE.txt
    │   │           ├── README.md
    │   │           ├── testall.sh
    │   │           ├── xxhash_amd64.s
    │   │           ├── xxhash_arm64.s
    │   │           ├── xxhash_asm.go
    │   │           ├── xxhash.go
    │   │           ├── xxhash_other.go
    │   │           ├── xxhash_safe.go
    │   │           └── xxhash_unsafe.go
    │   ├── cloudwego
    │   │   └── base64x
    │   │       ├── base64x.go
    │   │       ├── base64x_subr_amd64.go
    │   │       ├── check_branch_name.sh
    │   │       ├── CODE_OF_CONDUCT.md
    │   │       ├── CONTRIBUTING.md
    │   │       ├── faststr.go
    │   │       ├── internal
    │   │       │   ├── native
    │   │       │   │   ├── avx2
    │   │       │   │   │   ├── b64decode.go
    │   │       │   │   │   ├── b64decode_subr.go
    │   │       │   │   │   ├── b64decode_text_amd64.go
    │   │       │   │   │   ├── b64encode.go
    │   │       │   │   │   ├── b64encode_subr.go
    │   │       │   │   │   ├── b64encode_text_amd64.go
    │   │       │   │   │   └── native_export.go
    │   │       │   │   ├── b64decode.tmpl
    │   │       │   │   ├── b64encode.tmpl
    │   │       │   │   ├── dispatch.go
    │   │       │   │   ├── native_export.tmpl
    │   │       │   │   └── sse
    │   │       │   │       ├── b64decode.go
    │   │       │   │       ├── b64decode_subr.go
    │   │       │   │       ├── b64decode_text_amd64.go
    │   │       │   │       ├── b64encode.go
    │   │       │   │       ├── b64encode_subr.go
    │   │       │   │       ├── b64encode_text_amd64.go
    │   │       │   │       └── native_export.go
    │   │       │   └── rt
    │   │       │       ├── asm_amd64.s
    │   │       │       ├── asm_arm64.s
    │   │       │       └── fastmem.go
    │   │       ├── LICENSE
    │   │       ├── LICENSE-APACHE
    │   │       ├── Makefile
    │   │       ├── README.md
    │   │       └── _typos.toml
    │   ├── creack
    │   │   └── pty
    │   │       ├── asm_solaris_amd64.s
    │   │       ├── doc.go
    │   │       ├── Dockerfile.golang
    │   │       ├── ioctl_bsd.go
    │   │       ├── ioctl.go
    │   │       ├── ioctl_inner.go
    │   │       ├── ioctl_legacy.go
    │   │       ├── ioctl_solaris.go
    │   │       ├── ioctl_unsupported.go
    │   │       ├── LICENSE
    │   │       ├── mktypes.bash
    │   │       ├── pty_darwin.go
    │   │       ├── pty_dragonfly.go
    │   │       ├── pty_freebsd.go
    │   │       ├── pty_linux.go
    │   │       ├── pty_netbsd.go
    │   │       ├── pty_openbsd.go
    │   │       ├── pty_solaris.go
    │   │       ├── pty_unsupported.go
    │   │       ├── pty_zos.go
    │   │       ├── README.md
    │   │       ├── run.go
    │   │       ├── start.go
    │   │       ├── start_windows.go
    │   │       ├── test_crosscompile.sh
    │   │       ├── winsize.go
    │   │       ├── winsize_unix.go
    │   │       ├── winsize_unsupported.go
    │   │       ├── ztypes_386.go
    │   │       ├── ztypes_amd64.go
    │   │       ├── ztypes_arm64.go
    │   │       ├── ztypes_arm.go
    │   │       ├── ztypes_dragonfly_amd64.go
    │   │       ├── ztypes_freebsd_386.go
    │   │       ├── ztypes_freebsd_amd64.go
    │   │       ├── ztypes_freebsd_arm64.go
    │   │       ├── ztypes_freebsd_arm.go
    │   │       ├── ztypes_freebsd_ppc64.go
    │   │       ├── ztypes_freebsd_riscv64.go
    │   │       ├── ztypes_loong64.go
    │   │       ├── ztypes_mipsx.go
    │   │       ├── ztypes_netbsd_32bit_int.go
    │   │       ├── ztypes_openbsd_32bit_int.go
    │   │       ├── ztypes_ppc64.go
    │   │       ├── ztypes_ppc64le.go
    │   │       ├── ztypes_ppc.go
    │   │       ├── ztypes_riscvx.go
    │   │       ├── ztypes_s390x.go
    │   │       └── ztypes_sparcx.go
    │   ├── gabriel-vasile
    │   │   └── mimetype
    │   │       ├── CODE_OF_CONDUCT.md
    │   │       ├── CONTRIBUTING.md
    │   │       ├── internal
    │   │       │   ├── charset
    │   │       │   │   └── charset.go
    │   │       │   ├── json
    │   │       │   │   └── json.go
    │   │       │   └── magic
    │   │       │       ├── archive.go
    │   │       │       ├── audio.go
    │   │       │       ├── binary.go
    │   │       │       ├── database.go
    │   │       │       ├── document.go
    │   │       │       ├── font.go
    │   │       │       ├── ftyp.go
    │   │       │       ├── geo.go
    │   │       │       ├── image.go
    │   │       │       ├── magic.go
    │   │       │       ├── ms_office.go
    │   │       │       ├── ogg.go
    │   │       │       ├── text_csv.go
    │   │       │       ├── text.go
    │   │       │       ├── video.go
    │   │       │       └── zip.go
    │   │       ├── LICENSE
    │   │       ├── mime.go
    │   │       ├── mimetype.go
    │   │       ├── README.md
    │   │       ├── supported_mimes.md
    │   │       └── tree.go
    │   ├── gin-contrib
    │   │   └── sse
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       ├── sse-decoder.go
    │   │       ├── sse-encoder.go
    │   │       └── writer.go
    │   ├── gin-gonic
    │   │   └── gin
    │   │       ├── auth.go
    │   │       ├── AUTHORS.md
    │   │       ├── BENCHMARKS.md
    │   │       ├── binding
    │   │       │   ├── binding.go
    │   │       │   ├── binding_nomsgpack.go
    │   │       │   ├── default_validator.go
    │   │       │   ├── form.go
    │   │       │   ├── form_mapping.go
    │   │       │   ├── header.go
    │   │       │   ├── json.go
    │   │       │   ├── msgpack.go
    │   │       │   ├── multipart_form_mapping.go
    │   │       │   ├── protobuf.go
    │   │       │   ├── query.go
    │   │       │   ├── toml.go
    │   │       │   ├── uri.go
    │   │       │   ├── xml.go
    │   │       │   └── yaml.go
    │   │       ├── CHANGELOG.md
    │   │       ├── codecov.yml
    │   │       ├── CODE_OF_CONDUCT.md
    │   │       ├── context_appengine.go
    │   │       ├── context.go
    │   │       ├── CONTRIBUTING.md
    │   │       ├── debug.go
    │   │       ├── deprecated.go
    │   │       ├── doc.go
    │   │       ├── errors.go
    │   │       ├── fs.go
    │   │       ├── gin.go
    │   │       ├── internal
    │   │       │   ├── bytesconv
    │   │       │   │   ├── bytesconv_1.19.go
    │   │       │   │   └── bytesconv_1.20.go
    │   │       │   └── json
    │   │       │       ├── go_json.go
    │   │       │       ├── json.go
    │   │       │       ├── jsoniter.go
    │   │       │       └── sonic.go
    │   │       ├── LICENSE
    │   │       ├── logger.go
    │   │       ├── Makefile
    │   │       ├── mode.go
    │   │       ├── path.go
    │   │       ├── README.md
    │   │       ├── recovery.go
    │   │       ├── render
    │   │       │   ├── data.go
    │   │       │   ├── html.go
    │   │       │   ├── json.go
    │   │       │   ├── msgpack.go
    │   │       │   ├── protobuf.go
    │   │       │   ├── reader.go
    │   │       │   ├── redirect.go
    │   │       │   ├── render.go
    │   │       │   ├── text.go
    │   │       │   ├── toml.go
    │   │       │   ├── xml.go
    │   │       │   └── yaml.go
    │   │       ├── response_writer.go
    │   │       ├── routergroup.go
    │   │       ├── test_helpers.go
    │   │       ├── tree.go
    │   │       ├── utils.go
    │   │       └── version.go
    │   ├── goccy
    │   │   └── go-json
    │   │       ├── CHANGELOG.md
    │   │       ├── color.go
    │   │       ├── decode.go
    │   │       ├── docker-compose.yml
    │   │       ├── encode.go
    │   │       ├── error.go
    │   │       ├── internal
    │   │       │   ├── decoder
    │   │       │   │   ├── anonymous_field.go
    │   │       │   │   ├── array.go
    │   │       │   │   ├── assign.go
    │   │       │   │   ├── bool.go
    │   │       │   │   ├── bytes.go
    │   │       │   │   ├── compile.go
    │   │       │   │   ├── compile_norace.go
    │   │       │   │   ├── compile_race.go
    │   │       │   │   ├── context.go
    │   │       │   │   ├── float.go
    │   │       │   │   ├── func.go
    │   │       │   │   ├── interface.go
    │   │       │   │   ├── int.go
    │   │       │   │   ├── invalid.go
    │   │       │   │   ├── map.go
    │   │       │   │   ├── number.go
    │   │       │   │   ├── option.go
    │   │       │   │   ├── path.go
    │   │       │   │   ├── ptr.go
    │   │       │   │   ├── slice.go
    │   │       │   │   ├── stream.go
    │   │       │   │   ├── string.go
    │   │       │   │   ├── struct.go
    │   │       │   │   ├── type.go
    │   │       │   │   ├── uint.go
    │   │       │   │   ├── unmarshal_json.go
    │   │       │   │   ├── unmarshal_text.go
    │   │       │   │   └── wrapped_string.go
    │   │       │   ├── encoder
    │   │       │   │   ├── code.go
    │   │       │   │   ├── compact.go
    │   │       │   │   ├── compiler.go
    │   │       │   │   ├── compiler_norace.go
    │   │       │   │   ├── compiler_race.go
    │   │       │   │   ├── context.go
    │   │       │   │   ├── decode_rune.go
    │   │       │   │   ├── encoder.go
    │   │       │   │   ├── indent.go
    │   │       │   │   ├── int.go
    │   │       │   │   ├── map112.go
    │   │       │   │   ├── map113.go
    │   │       │   │   ├── opcode.go
    │   │       │   │   ├── option.go
    │   │       │   │   ├── optype.go
    │   │       │   │   ├── query.go
    │   │       │   │   ├── string.go
    │   │       │   │   ├── string_table.go
    │   │       │   │   ├── vm
    │   │       │   │   │   ├── debug_vm.go
    │   │       │   │   │   ├── hack.go
    │   │       │   │   │   ├── util.go
    │   │       │   │   │   └── vm.go
    │   │       │   │   ├── vm_color
    │   │       │   │   │   ├── debug_vm.go
    │   │       │   │   │   ├── hack.go
    │   │       │   │   │   ├── util.go
    │   │       │   │   │   └── vm.go
    │   │       │   │   ├── vm_color_indent
    │   │       │   │   │   ├── debug_vm.go
    │   │       │   │   │   ├── util.go
    │   │       │   │   │   └── vm.go
    │   │       │   │   └── vm_indent
    │   │       │   │       ├── debug_vm.go
    │   │       │   │       ├── hack.go
    │   │       │   │       ├── util.go
    │   │       │   │       └── vm.go
    │   │       │   ├── errors
    │   │       │   │   └── error.go
    │   │       │   └── runtime
    │   │       │       ├── rtype.go
    │   │       │       ├── struct_field.go
    │   │       │       └── type.go
    │   │       ├── json.go
    │   │       ├── LICENSE
    │   │       ├── Makefile
    │   │       ├── option.go
    │   │       ├── path.go
    │   │       ├── query.go
    │   │       └── README.md
    │   ├── go-kivik
    │   │   └── kivik
    │   │       └── v4
    │   │           ├── attachments.go
    │   │           ├── bulk.go
    │   │           ├── changes.go
    │   │           ├── cluster.go
    │   │           ├── codecov.yml
    │   │           ├── config.go
    │   │           ├── constants.go
    │   │           ├── CONTRIBUTING.md
    │   │           ├── couchdb
    │   │           │   ├── attachments.go
    │   │           │   ├── auth.go
    │   │           │   ├── bulkget.go
    │   │           │   ├── bulk.go
    │   │           │   ├── changes.go
    │   │           │   ├── chttp
    │   │           │   │   ├── auth.go
    │   │           │   │   ├── basicauth.go
    │   │           │   │   ├── chttp.go
    │   │           │   │   ├── constants.go
    │   │           │   │   ├── cookieauth.go
    │   │           │   │   ├── encode.go
    │   │           │   │   ├── errors.go
    │   │           │   │   ├── options.go
    │   │           │   │   ├── proxyauth.go
    │   │           │   │   ├── trace.go
    │   │           │   │   └── util.go
    │   │           │   ├── client.go
    │   │           │   ├── cluster.go
    │   │           │   ├── codecov.yml
    │   │           │   ├── config.go
    │   │           │   ├── constants.go
    │   │           │   ├── couchdb.go
    │   │           │   ├── db.go
    │   │           │   ├── dbstats.go
    │   │           │   ├── doc.go
    │   │           │   ├── errors.go
    │   │           │   ├── find.go
    │   │           │   ├── iter.go
    │   │           │   ├── json.go
    │   │           │   ├── options.go
    │   │           │   ├── README.md
    │   │           │   ├── replication.go
    │   │           │   ├── rows.go
    │   │           │   ├── scheduler.go
    │   │           │   ├── seqid.go
    │   │           │   ├── session.go
    │   │           │   ├── util.go
    │   │           │   └── version.go
    │   │           ├── db.go
    │   │           ├── doc.go
    │   │           ├── docker-compose.yml
    │   │           ├── document.go
    │   │           ├── driver
    │   │           │   ├── bulkget.go
    │   │           │   ├── changes.go
    │   │           │   ├── config.go
    │   │           │   ├── doc.go
    │   │           │   ├── driver.go
    │   │           │   ├── errors.go
    │   │           │   ├── partition.go
    │   │           │   ├── rows.go
    │   │           │   ├── search.go
    │   │           │   ├── session.go
    │   │           │   └── updates.go
    │   │           ├── errors.go
    │   │           ├── find.go
    │   │           ├── go.work
    │   │           ├── int
    │   │           │   └── errors
    │   │           │       ├── errors121.go
    │   │           │       ├── errors.go
    │   │           │       └── errorspre121.go
    │   │           ├── internal
    │   │           │   └── registry
    │   │           │       └── registry.go
    │   │           ├── ISSUE_TEMPLATE.md
    │   │           ├── iterator.go
    │   │           ├── kivik.go
    │   │           ├── LICENSE-2.0
    │   │           ├── LICENSE.md
    │   │           ├── NOTICE
    │   │           ├── options.go
    │   │           ├── package.json
    │   │           ├── README.md
    │   │           ├── replicate.go
    │   │           ├── replication.go
    │   │           ├── resultset.go
    │   │           ├── security.go
    │   │           ├── session.go
    │   │           ├── TODO.md
    │   │           ├── updates.go
    │   │           └── V5.md
    │   ├── google
    │   │   ├── jsonschema-go
    │   │   │   ├── jsonschema
    │   │   │   │   ├── annotations.go
    │   │   │   │   ├── doc.go
    │   │   │   │   ├── infer.go
    │   │   │   │   ├── json_pointer.go
    │   │   │   │   ├── resolve.go
    │   │   │   │   ├── schema.go
    │   │   │   │   ├── util.go
    │   │   │   │   └── validate.go
    │   │   │   └── LICENSE
    │   │   └── uuid
    │   │       ├── CHANGELOG.md
    │   │       ├── CONTRIBUTING.md
    │   │       ├── CONTRIBUTORS
    │   │       ├── dce.go
    │   │       ├── doc.go
    │   │       ├── hash.go
    │   │       ├── LICENSE
    │   │       ├── marshal.go
    │   │       ├── node.go
    │   │       ├── node_js.go
    │   │       ├── node_net.go
    │   │       ├── null.go
    │   │       ├── README.md
    │   │       ├── sql.go
    │   │       ├── time.go
    │   │       ├── util.go
    │   │       ├── uuid.go
    │   │       ├── version1.go
    │   │       ├── version4.go
    │   │       ├── version6.go
    │   │       └── version7.go
    │   ├── go-playground
    │   │   ├── locales
    │   │   │   ├── currency
    │   │   │   │   └── currency.go
    │   │   │   ├── LICENSE
    │   │   │   ├── logo.png
    │   │   │   ├── README.md
    │   │   │   └── rules.go
    │   │   ├── universal-translator
    │   │   │   ├── errors.go
    │   │   │   ├── import_export.go
    │   │   │   ├── LICENSE
    │   │   │   ├── logo.png
    │   │   │   ├── Makefile
    │   │   │   ├── README.md
    │   │   │   ├── translator.go
    │   │   │   └── universal_translator.go
    │   │   └── validator
    │   │       └── v10
    │   │           ├── baked_in.go
    │   │           ├── cache.go
    │   │           ├── country_codes.go
    │   │           ├── currency_codes.go
    │   │           ├── doc.go
    │   │           ├── errors.go
    │   │           ├── field_level.go
    │   │           ├── LICENSE
    │   │           ├── logo.png
    │   │           ├── MAINTAINERS.md
    │   │           ├── Makefile
    │   │           ├── options.go
    │   │           ├── postcode_regexes.go
    │   │           ├── README.md
    │   │           ├── regexes.go
    │   │           ├── struct_level.go
    │   │           ├── translations.go
    │   │           ├── util.go
    │   │           ├── validator.go
    │   │           └── validator_instance.go
    │   ├── gorilla
    │   │   ├── mux
    │   │   │   ├── doc.go
    │   │   │   ├── LICENSE
    │   │   │   ├── Makefile
    │   │   │   ├── middleware.go
    │   │   │   ├── mux.go
    │   │   │   ├── README.md
    │   │   │   ├── regexp.go
    │   │   │   ├── route.go
    │   │   │   └── test_helpers.go
    │   │   └── websocket
    │   │       ├── AUTHORS
    │   │       ├── client.go
    │   │       ├── compression.go
    │   │       ├── conn.go
    │   │       ├── doc.go
    │   │       ├── join.go
    │   │       ├── json.go
    │   │       ├── LICENSE
    │   │       ├── mask.go
    │   │       ├── mask_safe.go
    │   │       ├── prepared.go
    │   │       ├── proxy.go
    │   │       ├── README.md
    │   │       ├── server.go
    │   │       ├── tls_handshake_116.go
    │   │       ├── tls_handshake.go
    │   │       ├── util.go
    │   │       └── x_net_proxy.go
    │   ├── go-sql-driver
    │   │   └── mysql
    │   │       ├── atomic_bool.go
    │   │       ├── atomic_bool_go118.go
    │   │       ├── auth.go
    │   │       ├── AUTHORS
    │   │       ├── buffer.go
    │   │       ├── CHANGELOG.md
    │   │       ├── collations.go
    │   │       ├── conncheck_dummy.go
    │   │       ├── conncheck.go
    │   │       ├── connection.go
    │   │       ├── connector.go
    │   │       ├── const.go
    │   │       ├── driver.go
    │   │       ├── dsn.go
    │   │       ├── errors.go
    │   │       ├── fields.go
    │   │       ├── infile.go
    │   │       ├── LICENSE
    │   │       ├── nulltime.go
    │   │       ├── packets.go
    │   │       ├── README.md
    │   │       ├── result.go
    │   │       ├── rows.go
    │   │       ├── statement.go
    │   │       ├── transaction.go
    │   │       └── utils.go
    │   ├── joho
    │   │   └── godotenv
    │   │       ├── godotenv.go
    │   │       ├── LICENCE
    │   │       ├── parser.go
    │   │       └── README.md
    │   ├── json-iterator
    │   │   └── go
    │   │       ├── adapter.go
    │   │       ├── any_array.go
    │   │       ├── any_bool.go
    │   │       ├── any_float.go
    │   │       ├── any.go
    │   │       ├── any_int32.go
    │   │       ├── any_int64.go
    │   │       ├── any_invalid.go
    │   │       ├── any_nil.go
    │   │       ├── any_number.go
    │   │       ├── any_object.go
    │   │       ├── any_str.go
    │   │       ├── any_uint32.go
    │   │       ├── any_uint64.go
    │   │       ├── build.sh
    │   │       ├── config.go
    │   │       ├── fuzzy_mode_convert_table.md
    │   │       ├── Gopkg.lock
    │   │       ├── Gopkg.toml
    │   │       ├── iter_array.go
    │   │       ├── iter_float.go
    │   │       ├── iter.go
    │   │       ├── iter_int.go
    │   │       ├── iter_object.go
    │   │       ├── iter_skip.go
    │   │       ├── iter_skip_sloppy.go
    │   │       ├── iter_skip_strict.go
    │   │       ├── iter_str.go
    │   │       ├── jsoniter.go
    │   │       ├── LICENSE
    │   │       ├── pool.go
    │   │       ├── README.md
    │   │       ├── reflect_array.go
    │   │       ├── reflect_dynamic.go
    │   │       ├── reflect_extension.go
    │   │       ├── reflect.go
    │   │       ├── reflect_json_number.go
    │   │       ├── reflect_json_raw_message.go
    │   │       ├── reflect_map.go
    │   │       ├── reflect_marshaler.go
    │   │       ├── reflect_native.go
    │   │       ├── reflect_optional.go
    │   │       ├── reflect_slice.go
    │   │       ├── reflect_struct_decoder.go
    │   │       ├── reflect_struct_encoder.go
    │   │       ├── stream_float.go
    │   │       ├── stream.go
    │   │       ├── stream_int.go
    │   │       ├── stream_str.go
    │   │       └── test.sh
    │   ├── klauspost
    │   │   └── cpuid
    │   │       └── v2
    │   │           ├── CONTRIBUTING.txt
    │   │           ├── cpuid_386.s
    │   │           ├── cpuid_amd64.s
    │   │           ├── cpuid_arm64.s
    │   │           ├── cpuid.go
    │   │           ├── detect_arm64.go
    │   │           ├── detect_ref_arm64.go
    │   │           ├── detect_ref.go
    │   │           ├── detect_riscv64.go
    │   │           ├── detect_x86.go
    │   │           ├── featureid_string.go
    │   │           ├── LICENSE
    │   │           ├── os_darwin_arm64.go
    │   │           ├── os_linux_arm64.go
    │   │           ├── os_linux_riscv64.go
    │   │           ├── os_other_arm64.go
    │   │           ├── os_other_riscv64.go
    │   │           ├── os_safe_linux_arm64.go
    │   │           ├── os_unsafe_linux_arm64.go
    │   │           ├── README.md
    │   │           ├── riscv_isa.go
    │   │           └── test-architectures.sh
    │   ├── leodido
    │   │   └── go-urn
    │   │       ├── kind.go
    │   │       ├── LICENSE
    │   │       ├── machine.go
    │   │       ├── machine.go.rl
    │   │       ├── makefile
    │   │       ├── options.go
    │   │       ├── parsing_mode.go
    │   │       ├── README.md
    │   │       ├── scim
    │   │       │   └── schema
    │   │       │       └── type.go
    │   │       ├── scim.go
    │   │       ├── urn8141.go
    │   │       └── urn.go
    │   ├── mattn
    │   │   └── go-isatty
    │   │       ├── doc.go
    │   │       ├── go.test.sh
    │   │       ├── isatty_bsd.go
    │   │       ├── isatty_others.go
    │   │       ├── isatty_plan9.go
    │   │       ├── isatty_solaris.go
    │   │       ├── isatty_tcgets.go
    │   │       ├── isatty_windows.go
    │   │       ├── LICENSE
    │   │       └── README.md
    │   ├── modelcontextprotocol
    │   │   └── go-sdk
    │   │       ├── auth
    │   │       │   ├── auth.go
    │   │       │   └── client.go
    │   │       ├── internal
    │   │       │   ├── json
    │   │       │   │   └── json.go
    │   │       │   ├── jsonrpc2
    │   │       │   │   ├── conn.go
    │   │       │   │   ├── frame.go
    │   │       │   │   ├── jsonrpc2.go
    │   │       │   │   ├── messages.go
    │   │       │   │   ├── net.go
    │   │       │   │   ├── serve.go
    │   │       │   │   └── wire.go
    │   │       │   ├── util
    │   │       │   │   └── util.go
    │   │       │   └── xcontext
    │   │       │       └── xcontext.go
    │   │       ├── jsonrpc
    │   │       │   └── jsonrpc.go
    │   │       ├── LICENSE
    │   │       ├── mcp
    │   │       │   ├── client.go
    │   │       │   ├── cmd.go
    │   │       │   ├── content.go
    │   │       │   ├── event.go
    │   │       │   ├── features.go
    │   │       │   ├── logging.go
    │   │       │   ├── mcp.go
    │   │       │   ├── prompt.go
    │   │       │   ├── protocol.go
    │   │       │   ├── requests.go
    │   │       │   ├── resource.go
    │   │       │   ├── resource_go124.go
    │   │       │   ├── resource_pre_go124.go
    │   │       │   ├── schema_cache.go
    │   │       │   ├── server.go
    │   │       │   ├── session.go
    │   │       │   ├── shared.go
    │   │       │   ├── sse.go
    │   │       │   ├── streamable_client.go
    │   │       │   ├── streamable.go
    │   │       │   ├── streamable_server.go
    │   │       │   ├── tool.go
    │   │       │   ├── transport.go
    │   │       │   └── util.go
    │   │       └── oauthex
    │   │           ├── auth_meta.go
    │   │           ├── dcr.go
    │   │           ├── oauth2.go
    │   │           ├── oauthex.go
    │   │           └── resource_meta.go
    │   ├── modern-go
    │   │   ├── concurrent
    │   │   │   ├── executor.go
    │   │   │   ├── go_above_19.go
    │   │   │   ├── go_below_19.go
    │   │   │   ├── LICENSE
    │   │   │   ├── log.go
    │   │   │   ├── README.md
    │   │   │   ├── test.sh
    │   │   │   └── unbounded_executor.go
    │   │   └── reflect2
    │   │       ├── go_above_118.go
    │   │       ├── go_above_19.go
    │   │       ├── go_below_118.go
    │   │       ├── Gopkg.lock
    │   │       ├── Gopkg.toml
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       ├── reflect2_amd64.s
    │   │       ├── reflect2.go
    │   │       ├── reflect2_kind.go
    │   │       ├── relfect2_386.s
    │   │       ├── relfect2_amd64p32.s
    │   │       ├── relfect2_arm64.s
    │   │       ├── relfect2_arm.s
    │   │       ├── relfect2_mips64x.s
    │   │       ├── relfect2_mipsx.s
    │   │       ├── relfect2_ppc64x.s
    │   │       ├── relfect2_s390x.s
    │   │       ├── safe_field.go
    │   │       ├── safe_map.go
    │   │       ├── safe_slice.go
    │   │       ├── safe_struct.go
    │   │       ├── safe_type.go
    │   │       ├── type_map.go
    │   │       ├── unsafe_array.go
    │   │       ├── unsafe_eface.go
    │   │       ├── unsafe_field.go
    │   │       ├── unsafe_iface.go
    │   │       ├── unsafe_link.go
    │   │       ├── unsafe_map.go
    │   │       ├── unsafe_ptr.go
    │   │       ├── unsafe_slice.go
    │   │       ├── unsafe_struct.go
    │   │       └── unsafe_type.go
    │   ├── pelletier
    │   │   └── go-toml
    │   │       └── v2
    │   │           ├── ci.sh
    │   │           ├── CONTRIBUTING.md
    │   │           ├── decode.go
    │   │           ├── doc.go
    │   │           ├── Dockerfile
    │   │           ├── errors.go
    │   │           ├── internal
    │   │           │   ├── characters
    │   │           │   │   ├── ascii.go
    │   │           │   │   └── utf8.go
    │   │           │   ├── danger
    │   │           │   │   ├── danger.go
    │   │           │   │   └── typeid.go
    │   │           │   └── tracker
    │   │           │       ├── key.go
    │   │           │       ├── seen.go
    │   │           │       └── tracker.go
    │   │           ├── LICENSE
    │   │           ├── localtime.go
    │   │           ├── marshaler.go
    │   │           ├── README.md
    │   │           ├── SECURITY.md
    │   │           ├── strict.go
    │   │           ├── toml.abnf
    │   │           ├── types.go
    │   │           ├── unmarshaler.go
    │   │           └── unstable
    │   │               ├── ast.go
    │   │               ├── builder.go
    │   │               ├── doc.go
    │   │               ├── kind.go
    │   │               ├── parser.go
    │   │               ├── scanner.go
    │   │               └── unmarshaler.go
    │   ├── redis
    │   │   └── go-redis
    │   │       └── v9
    │   │           ├── acl_commands.go
    │   │           ├── adapters.go
    │   │           ├── AGENTS.md
    │   │           ├── array_commands.go
    │   │           ├── auth
    │   │           │   ├── auth.go
    │   │           │   └── reauth_credentials_listener.go
    │   │           ├── autopipeline_bench_README.md
    │   │           ├── autopipeline_cluster_fd.go
    │   │           ├── autopipeline_fd_pipeline.go
    │   │           ├── autopipeline_fdqueue.go
    │   │           ├── autopipeline_fd_shards.go
    │   │           ├── autopipeline_fullduplex.go
    │   │           ├── autopipeline.go
    │   │           ├── bitmap_commands.go
    │   │           ├── CLAUDE.md
    │   │           ├── cluster_commands.go
    │   │           ├── command.go
    │   │           ├── command_policy_resolver.go
    │   │           ├── commands.go
    │   │           ├── CONTRIBUTING.md
    │   │           ├── csc_commands.go
    │   │           ├── csc_integration.go
    │   │           ├── csc_inval_batch.go
    │   │           ├── csc_miss_coalesce.go
    │   │           ├── csc_miss_coalesce_modes.go
    │   │           ├── csc_refresh_on_invalidate.go
    │   │           ├── csc_refresh_support.go
    │   │           ├── csc_stats.go
    │   │           ├── dial_retry_backoff.go
    │   │           ├── doc.go
    │   │           ├── docker-compose.yml
    │   │           ├── error.go
    │   │           ├── generic_commands.go
    │   │           ├── geo_commands.go
    │   │           ├── hash_commands.go
    │   │           ├── himport_cluster.go
    │   │           ├── himport_commands.go
    │   │           ├── himport.go
    │   │           ├── hotkeys_commands.go
    │   │           ├── hyperloglog_commands.go
    │   │           ├── internal
    │   │           │   ├── arg.go
    │   │           │   ├── auth
    │   │           │   │   └── streaming
    │   │           │   │       ├── conn_reauth_credentials_listener.go
    │   │           │   │       ├── cred_listeners.go
    │   │           │   │       ├── manager.go
    │   │           │   │       └── pool_hook.go
    │   │           │   ├── hashtag
    │   │           │   │   ├── hashtag.go
    │   │           │   │   └── rendezvous.go
    │   │           │   ├── hscan
    │   │           │   │   ├── hscan.go
    │   │           │   │   └── structmap.go
    │   │           │   ├── interfaces
    │   │           │   │   └── interfaces.go
    │   │           │   ├── internal.go
    │   │           │   ├── log.go
    │   │           │   ├── maintnotifications
    │   │           │   │   └── logs
    │   │           │   │       └── log_messages.go
    │   │           │   ├── once.go
    │   │           │   ├── otel
    │   │           │   │   └── metrics.go
    │   │           │   ├── pool
    │   │           │   │   ├── conn_check_dummy.go
    │   │           │   │   ├── conn_check.go
    │   │           │   │   ├── conn.go
    │   │           │   │   ├── conn_state.go
    │   │           │   │   ├── hooks.go
    │   │           │   │   ├── pool.go
    │   │           │   │   ├── pool_single.go
    │   │           │   │   ├── pool_sticky.go
    │   │           │   │   ├── pubsub.go
    │   │           │   │   └── want_conn.go
    │   │           │   ├── proto
    │   │           │   │   ├── reader_buffered.go
    │   │           │   │   ├── reader.go
    │   │           │   │   ├── redis_errors.go
    │   │           │   │   ├── scan.go
    │   │           │   │   └── writer.go
    │   │           │   ├── redis.go
    │   │           │   ├── routing
    │   │           │   │   ├── aggregator.go
    │   │           │   │   ├── policy.go
    │   │           │   │   └── shard_picker.go
    │   │           │   ├── semaphore.go
    │   │           │   ├── util
    │   │           │   │   ├── atomic_max.go
    │   │           │   │   ├── atomic_min.go
    │   │           │   │   ├── convert.go
    │   │           │   │   ├── safe.go
    │   │           │   │   ├── strconv.go
    │   │           │   │   ├── type.go
    │   │           │   │   └── unsafe.go
    │   │           │   └── util.go
    │   │           ├── iterator.go
    │   │           ├── json.go
    │   │           ├── LICENSE
    │   │           ├── list_commands.go
    │   │           ├── local_cache.go
    │   │           ├── maintnotifications
    │   │           │   ├── circuit_breaker.go
    │   │           │   ├── config.go
    │   │           │   ├── errors.go
    │   │           │   ├── example_hooks.go
    │   │           │   ├── FEATURES.md
    │   │           │   ├── handoff_worker.go
    │   │           │   ├── hooks.go
    │   │           │   ├── manager.go
    │   │           │   ├── pool_hook.go
    │   │           │   ├── push_notification_handler.go
    │   │           │   ├── README.md
    │   │           │   └── state.go
    │   │           ├── Makefile
    │   │           ├── options.go
    │   │           ├── osscluster_commands.go
    │   │           ├── osscluster.go
    │   │           ├── osscluster_router.go
    │   │           ├── otel.go
    │   │           ├── pipeline.go
    │   │           ├── probabilistic.go
    │   │           ├── pubsub_commands.go
    │   │           ├── pubsub.go
    │   │           ├── push
    │   │           │   ├── errors.go
    │   │           │   ├── handler_context.go
    │   │           │   ├── handler.go
    │   │           │   ├── processor.go
    │   │           │   ├── push.go
    │   │           │   └── registry.go
    │   │           ├── push_notifications.go
    │   │           ├── README.md
    │   │           ├── redis.go
    │   │           ├── RELEASE-NOTES.md
    │   │           ├── RELEASING.md
    │   │           ├── result.go
    │   │           ├── ring.go
    │   │           ├── script.go
    │   │           ├── scripting_commands.go
    │   │           ├── search_builders.go
    │   │           ├── search_collect.go
    │   │           ├── search_commands.go
    │   │           ├── SECURITY.md
    │   │           ├── sentinel.go
    │   │           ├── set_commands.go
    │   │           ├── sortedset_commands.go
    │   │           ├── stream_commands.go
    │   │           ├── string_commands.go
    │   │           ├── timeseries_commands.go
    │   │           ├── tx.go
    │   │           ├── universal.go
    │   │           ├── vectorset_commands.go
    │   │           └── version.go
    │   ├── segmentio
    │   │   ├── asm
    │   │   │   ├── ascii
    │   │   │   │   ├── ascii.go
    │   │   │   │   ├── equal_fold_amd64.go
    │   │   │   │   ├── equal_fold_amd64.s
    │   │   │   │   ├── equal_fold_default.go
    │   │   │   │   ├── equal_fold.go
    │   │   │   │   ├── valid_amd64.go
    │   │   │   │   ├── valid_amd64.s
    │   │   │   │   ├── valid_default.go
    │   │   │   │   ├── valid.go
    │   │   │   │   ├── valid_print_amd64.go
    │   │   │   │   ├── valid_print_amd64.s
    │   │   │   │   ├── valid_print_default.go
    │   │   │   │   └── valid_print.go
    │   │   │   ├── base64
    │   │   │   │   ├── base64_amd64.go
    │   │   │   │   ├── base64_default.go
    │   │   │   │   ├── base64.go
    │   │   │   │   ├── decode_amd64.go
    │   │   │   │   ├── decode_amd64.s
    │   │   │   │   ├── encode_amd64.go
    │   │   │   │   └── encode_amd64.s
    │   │   │   ├── cpu
    │   │   │   │   ├── arm
    │   │   │   │   │   └── arm.go
    │   │   │   │   ├── arm64
    │   │   │   │   │   └── arm64.go
    │   │   │   │   ├── cpu.go
    │   │   │   │   ├── cpuid
    │   │   │   │   │   └── cpuid.go
    │   │   │   │   └── x86
    │   │   │   │       └── x86.go
    │   │   │   ├── internal
    │   │   │   │   └── unsafebytes
    │   │   │   │       └── unsafebytes.go
    │   │   │   ├── keyset
    │   │   │   │   ├── keyset_amd64.go
    │   │   │   │   ├── keyset_amd64.s
    │   │   │   │   ├── keyset_arm64.go
    │   │   │   │   ├── keyset_arm64.s
    │   │   │   │   ├── keyset_default.go
    │   │   │   │   └── keyset.go
    │   │   │   └── LICENSE
    │   │   └── encoding
    │   │       ├── ascii
    │   │       │   ├── equal_fold.go
    │   │       │   ├── valid.go
    │   │       │   └── valid_print.go
    │   │       ├── iso8601
    │   │       │   ├── parse.go
    │   │       │   └── valid.go
    │   │       ├── json
    │   │       │   ├── codec.go
    │   │       │   ├── decode.go
    │   │       │   ├── encode.go
    │   │       │   ├── int.go
    │   │       │   ├── json.go
    │   │       │   ├── parse.go
    │   │       │   ├── README.md
    │   │       │   ├── reflect.go
    │   │       │   ├── reflect_optimize.go
    │   │       │   ├── string.go
    │   │       │   └── token.go
    │   │       └── LICENSE
    │   ├── twitchyliquid64
    │   │   └── golang-asm
    │   │       ├── asm
    │   │       │   └── arch
    │   │       │       ├── arch.go
    │   │       │       ├── arm64.go
    │   │       │       ├── arm.go
    │   │       │       ├── mips.go
    │   │       │       ├── ppc64.go
    │   │       │       ├── riscv64.go
    │   │       │       └── s390x.go
    │   │       ├── bio
    │   │       │   ├── buf.go
    │   │       │   ├── buf_mmap.go
    │   │       │   ├── buf_nommap.go
    │   │       │   └── must.go
    │   │       ├── dwarf
    │   │       │   ├── dwarf_defs.go
    │   │       │   └── dwarf.go
    │   │       ├── goobj
    │   │       │   ├── builtin.go
    │   │       │   ├── builtinlist.go
    │   │       │   ├── funcinfo.go
    │   │       │   └── objfile.go
    │   │       ├── LICENSE
    │   │       ├── obj
    │   │       │   ├── abi_string.go
    │   │       │   ├── addrtype_string.go
    │   │       │   ├── arm
    │   │       │   │   ├── anames5.go
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── a.out.go
    │   │       │   │   ├── asm5.go
    │   │       │   │   ├── list5.go
    │   │       │   │   └── obj5.go
    │   │       │   ├── arm64
    │   │       │   │   ├── anames7.go
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── a.out.go
    │   │       │   │   ├── asm7.go
    │   │       │   │   ├── doc.go
    │   │       │   │   ├── list7.go
    │   │       │   │   ├── obj7.go
    │   │       │   │   └── sysRegEnc.go
    │   │       │   ├── data.go
    │   │       │   ├── dwarf.go
    │   │       │   ├── go.go
    │   │       │   ├── inl.go
    │   │       │   ├── ld.go
    │   │       │   ├── line.go
    │   │       │   ├── link.go
    │   │       │   ├── mips
    │   │       │   │   ├── anames0.go
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── a.out.go
    │   │       │   │   ├── asm0.go
    │   │       │   │   ├── list0.go
    │   │       │   │   └── obj0.go
    │   │       │   ├── objfile.go
    │   │       │   ├── pass.go
    │   │       │   ├── pcln.go
    │   │       │   ├── plist.go
    │   │       │   ├── ppc64
    │   │       │   │   ├── anames9.go
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── a.out.go
    │   │       │   │   ├── asm9.go
    │   │       │   │   ├── doc.go
    │   │       │   │   ├── list9.go
    │   │       │   │   └── obj9.go
    │   │       │   ├── riscv
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── cpu.go
    │   │       │   │   ├── inst.go
    │   │       │   │   ├── list.go
    │   │       │   │   └── obj.go
    │   │       │   ├── s390x
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── anamesz.go
    │   │       │   │   ├── a.out.go
    │   │       │   │   ├── asmz.go
    │   │       │   │   ├── condition_code.go
    │   │       │   │   ├── listz.go
    │   │       │   │   ├── objz.go
    │   │       │   │   ├── rotate.go
    │   │       │   │   └── vector.go
    │   │       │   ├── sym.go
    │   │       │   ├── textflag.go
    │   │       │   ├── util.go
    │   │       │   ├── wasm
    │   │       │   │   ├── anames.go
    │   │       │   │   ├── a.out.go
    │   │       │   │   └── wasmobj.go
    │   │       │   └── x86
    │   │       │       ├── aenum.go
    │   │       │       ├── anames.go
    │   │       │       ├── a.out.go
    │   │       │       ├── asm6.go
    │   │       │       ├── avx_optabs.go
    │   │       │       ├── evex.go
    │   │       │       ├── list6.go
    │   │       │       ├── obj6.go
    │   │       │       └── ytab.go
    │   │       ├── objabi
    │   │       │   ├── autotype.go
    │   │       │   ├── flag.go
    │   │       │   ├── funcdata.go
    │   │       │   ├── funcid.go
    │   │       │   ├── head.go
    │   │       │   ├── line.go
    │   │       │   ├── path.go
    │   │       │   ├── reloctype.go
    │   │       │   ├── reloctype_string.go
    │   │       │   ├── stack.go
    │   │       │   ├── symkind.go
    │   │       │   ├── symkind_string.go
    │   │       │   ├── typekind.go
    │   │       │   └── util.go
    │   │       ├── src
    │   │       │   ├── pos.go
    │   │       │   └── xpos.go
    │   │       ├── sys
    │   │       │   ├── arch.go
    │   │       │   └── supported.go
    │   │       └── unsafeheader
    │   │           └── unsafeheader.go
    │   ├── ugorji
    │   │   └── go
    │   │       └── codec
    │   │           ├── 0_importpath.go
    │   │           ├── binc.go
    │   │           ├── build.sh
    │   │           ├── cbor.go
    │   │           ├── codecgen.go
    │   │           ├── decimal.go
    │   │           ├── decode.go
    │   │           ├── doc.go
    │   │           ├── encode.go
    │   │           ├── fast-path.generated.go
    │   │           ├── fast-path.go.tmpl
    │   │           ├── fast-path.not.go
    │   │           ├── gen-dec-array.go.tmpl
    │   │           ├── gen-dec-map.go.tmpl
    │   │           ├── gen-enc-chan.go.tmpl
    │   │           ├── gen.generated.go
    │   │           ├── gen.go
    │   │           ├── gen-helper.generated.go
    │   │           ├── gen-helper.go.tmpl
    │   │           ├── goversion_arrayof_gte_go15.go
    │   │           ├── goversion_arrayof_lt_go15.go
    │   │           ├── goversion_fmt_time_gte_go15.go
    │   │           ├── goversion_fmt_time_lt_go15.go
    │   │           ├── goversion_growslice_unsafe_gte_go120.go
    │   │           ├── goversion_growslice_unsafe_lt_go120.go
    │   │           ├── goversion_makemap_lt_go110.go
    │   │           ├── goversion_makemap_not_unsafe_gte_go110.go
    │   │           ├── goversion_makemap_unsafe_gte_go110.go
    │   │           ├── goversion_maprange_gte_go112.go
    │   │           ├── goversion_maprange_lt_go112.go
    │   │           ├── goversion_unexportedembeddedptr_gte_go110.go
    │   │           ├── goversion_unexportedembeddedptr_lt_go110.go
    │   │           ├── goversion_unsupported_lt_go14.go
    │   │           ├── goversion_vendor_eq_go15.go
    │   │           ├── goversion_vendor_eq_go16.go
    │   │           ├── goversion_vendor_gte_go17.go
    │   │           ├── goversion_vendor_lt_go15.go
    │   │           ├── helper.go
    │   │           ├── helper_internal.go
    │   │           ├── helper_not_unsafe.go
    │   │           ├── helper_not_unsafe_not_gc.go
    │   │           ├── helper.s
    │   │           ├── helper_unsafe_compiler_gc.go
    │   │           ├── helper_unsafe_compiler_not_gc.go
    │   │           ├── helper_unsafe.go
    │   │           ├── json.go
    │   │           ├── LICENSE
    │   │           ├── mammoth2-test.go.tmpl
    │   │           ├── mammoth-test.go.tmpl
    │   │           ├── msgpack.go
    │   │           ├── reader.go
    │   │           ├── README.md
    │   │           ├── register_ext.go
    │   │           ├── rpc.go
    │   │           ├── simple.go
    │   │           ├── sort-slice.generated.go
    │   │           ├── sort-slice.go.tmpl
    │   │           ├── test-cbor-goldens.json
    │   │           ├── test.py
    │   │           └── writer.go
    │   └── yosida95
    │       └── uritemplate
    │           └── v3
    │               ├── compile.go
    │               ├── equals.go
    │               ├── error.go
    │               ├── escape.go
    │               ├── expression.go
    │               ├── LICENSE
    │               ├── machine.go
    │               ├── match.go
    │               ├── parse.go
    │               ├── prog.go
    │               ├── README.rst
    │               ├── uritemplate.go
    │               └── value.go
    ├── golang.org
    │   └── x
    │       ├── arch
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   └── x86
    │       │       └── x86asm
    │       │           ├── decode.go
    │       │           ├── gnu.go
    │       │           ├── inst.go
    │       │           ├── intel.go
    │       │           ├── Makefile
    │       │           ├── plan9x.go
    │       │           └── tables.go
    │       ├── crypto
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   └── sha3
    │       │       ├── doc.go
    │       │       ├── hashes.go
    │       │       ├── hashes_noasm.go
    │       │       ├── keccakf_amd64.go
    │       │       ├── keccakf_amd64.s
    │       │       ├── keccakf.go
    │       │       ├── sha3.go
    │       │       ├── sha3_s390x.go
    │       │       ├── sha3_s390x.s
    │       │       ├── shake.go
    │       │       └── shake_noasm.go
    │       ├── net
    │       │   ├── html
    │       │   │   ├── atom
    │       │   │   │   ├── atom.go
    │       │   │   │   └── table.go
    │       │   │   ├── const.go
    │       │   │   ├── doc.go
    │       │   │   ├── doctype.go
    │       │   │   ├── entity.go
    │       │   │   ├── escape.go
    │       │   │   ├── foreign.go
    │       │   │   ├── iter.go
    │       │   │   ├── node.go
    │       │   │   ├── parse.go
    │       │   │   ├── render.go
    │       │   │   └── token.go
    │       │   ├── http
    │       │   │   └── httpguts
    │       │   │       ├── guts.go
    │       │   │       └── httplex.go
    │       │   ├── http2
    │       │   │   ├── ascii.go
    │       │   │   ├── ciphers.go
    │       │   │   ├── client_conn_pool.go
    │       │   │   ├── config.go
    │       │   │   ├── config_go124.go
    │       │   │   ├── config_pre_go124.go
    │       │   │   ├── databuffer.go
    │       │   │   ├── errors.go
    │       │   │   ├── flow.go
    │       │   │   ├── frame.go
    │       │   │   ├── gotrack.go
    │       │   │   ├── h2c
    │       │   │   │   └── h2c.go
    │       │   │   ├── hpack
    │       │   │   │   ├── encode.go
    │       │   │   │   ├── hpack.go
    │       │   │   │   ├── huffman.go
    │       │   │   │   ├── static_table.go
    │       │   │   │   └── tables.go
    │       │   │   ├── http2.go
    │       │   │   ├── pipe.go
    │       │   │   ├── server.go
    │       │   │   ├── timer.go
    │       │   │   ├── transport.go
    │       │   │   ├── unencrypted.go
    │       │   │   ├── write.go
    │       │   │   ├── writesched.go
    │       │   │   ├── writesched_priority.go
    │       │   │   ├── writesched_random.go
    │       │   │   └── writesched_roundrobin.go
    │       │   ├── idna
    │       │   │   ├── go118.go
    │       │   │   ├── idna10.0.0.go
    │       │   │   ├── idna9.0.0.go
    │       │   │   ├── pre_go118.go
    │       │   │   ├── punycode.go
    │       │   │   ├── tables10.0.0.go
    │       │   │   ├── tables11.0.0.go
    │       │   │   ├── tables12.0.0.go
    │       │   │   ├── tables13.0.0.go
    │       │   │   ├── tables15.0.0.go
    │       │   │   ├── tables9.0.0.go
    │       │   │   ├── trie12.0.0.go
    │       │   │   ├── trie13.0.0.go
    │       │   │   ├── trie.go
    │       │   │   └── trieval.go
    │       │   ├── internal
    │       │   │   └── httpcommon
    │       │   │       ├── ascii.go
    │       │   │       ├── headermap.go
    │       │   │       └── request.go
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   └── publicsuffix
    │       │       ├── data
    │       │       │   ├── children
    │       │       │   ├── nodes
    │       │       │   └── text
    │       │       ├── list.go
    │       │       └── table.go
    │       ├── oauth2
    │       │   ├── CONTRIBUTING.md
    │       │   ├── deviceauth.go
    │       │   ├── internal
    │       │   │   ├── doc.go
    │       │   │   ├── oauth2.go
    │       │   │   ├── token.go
    │       │   │   └── transport.go
    │       │   ├── LICENSE
    │       │   ├── oauth2.go
    │       │   ├── pkce.go
    │       │   ├── README.md
    │       │   ├── token.go
    │       │   └── transport.go
    │       ├── sync
    │       │   ├── errgroup
    │       │   │   ├── errgroup.go
    │       │   │   ├── go120.go
    │       │   │   └── pre_go120.go
    │       │   ├── LICENSE
    │       │   └── PATENTS
    │       ├── sys
    │       │   ├── cpu
    │       │   │   ├── asm_aix_ppc64.s
    │       │   │   ├── asm_darwin_arm64_gc.s
    │       │   │   ├── asm_darwin_x86_gc.s
    │       │   │   ├── byteorder.go
    │       │   │   ├── cpu_aix.go
    │       │   │   ├── cpu_arm64.go
    │       │   │   ├── cpu_arm64.s
    │       │   │   ├── cpu_arm.go
    │       │   │   ├── cpu_darwin_arm64.go
    │       │   │   ├── cpu_darwin_arm64_other.go
    │       │   │   ├── cpu_darwin_x86.go
    │       │   │   ├── cpu_gc_arm64.go
    │       │   │   ├── cpu_gccgo_arm64.go
    │       │   │   ├── cpu_gccgo_s390x.go
    │       │   │   ├── cpu_gccgo_x86.c
    │       │   │   ├── cpu_gccgo_x86.go
    │       │   │   ├── cpu_gc_riscv64.go
    │       │   │   ├── cpu_gc_s390x.go
    │       │   │   ├── cpu_gc_x86.go
    │       │   │   ├── cpu_gc_x86.s
    │       │   │   ├── cpu.go
    │       │   │   ├── cpu_linux_arm64.go
    │       │   │   ├── cpu_linux_arm.go
    │       │   │   ├── cpu_linux.go
    │       │   │   ├── cpu_linux_loong64.go
    │       │   │   ├── cpu_linux_mips64x.go
    │       │   │   ├── cpu_linux_noinit.go
    │       │   │   ├── cpu_linux_ppc64x.go
    │       │   │   ├── cpu_linux_riscv64.go
    │       │   │   ├── cpu_linux_s390x.go
    │       │   │   ├── cpu_loong64.go
    │       │   │   ├── cpu_loong64.s
    │       │   │   ├── cpu_mips64x.go
    │       │   │   ├── cpu_mipsx.go
    │       │   │   ├── cpu_netbsd_amd64.go
    │       │   │   ├── cpu_netbsd_arm64.go
    │       │   │   ├── cpu_openbsd_arm64.go
    │       │   │   ├── cpu_openbsd_arm64.s
    │       │   │   ├── cpu_other_arm64.go
    │       │   │   ├── cpu_other_arm.go
    │       │   │   ├── cpu_other_mips64x.go
    │       │   │   ├── cpu_other_ppc64x.go
    │       │   │   ├── cpu_other_riscv64.go
    │       │   │   ├── cpu_other_x86.go
    │       │   │   ├── cpu_ppc64x.go
    │       │   │   ├── cpu_riscv64.go
    │       │   │   ├── cpu_riscv64.s
    │       │   │   ├── cpu_s390x.go
    │       │   │   ├── cpu_s390x.s
    │       │   │   ├── cpu_sparc64.go
    │       │   │   ├── cpu_wasm.go
    │       │   │   ├── cpu_windows_arm64.go
    │       │   │   ├── cpu_windows.go
    │       │   │   ├── cpu_x86.go
    │       │   │   ├── cpu_zos.go
    │       │   │   ├── cpu_zos_s390x.go
    │       │   │   ├── endian_big.go
    │       │   │   ├── endian_little.go
    │       │   │   ├── hwcap_linux.go
    │       │   │   ├── parse.go
    │       │   │   ├── proc_cpuinfo_linux.go
    │       │   │   ├── runtime_auxv.go
    │       │   │   ├── runtime_auxv_go121.go
    │       │   │   ├── syscall_aix_gccgo.go
    │       │   │   ├── syscall_aix_ppc64_gc.go
    │       │   │   ├── syscall_darwin_arm64_gc.go
    │       │   │   ├── syscall_darwin_x86_gc.go
    │       │   │   └── zcpu_windows.go
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   └── unix
    │       │       ├── affinity_linux.go
    │       │       ├── aliases.go
    │       │       ├── asm_aix_ppc64.s
    │       │       ├── asm_bsd_386.s
    │       │       ├── asm_bsd_amd64.s
    │       │       ├── asm_bsd_arm64.s
    │       │       ├── asm_bsd_arm.s
    │       │       ├── asm_bsd_ppc64.s
    │       │       ├── asm_bsd_riscv64.s
    │       │       ├── asm_linux_386.s
    │       │       ├── asm_linux_amd64.s
    │       │       ├── asm_linux_arm64.s
    │       │       ├── asm_linux_arm.s
    │       │       ├── asm_linux_loong64.s
    │       │       ├── asm_linux_mips64x.s
    │       │       ├── asm_linux_mipsx.s
    │       │       ├── asm_linux_ppc64x.s
    │       │       ├── asm_linux_riscv64.s
    │       │       ├── asm_linux_s390x.s
    │       │       ├── asm_openbsd_mips64.s
    │       │       ├── asm_solaris_amd64.s
    │       │       ├── asm_zos_s390x.s
    │       │       ├── auxv.go
    │       │       ├── auxv_unsupported.go
    │       │       ├── bluetooth_linux.go
    │       │       ├── bpxsvc_zos.go
    │       │       ├── bpxsvc_zos.s
    │       │       ├── cap_freebsd.go
    │       │       ├── constants.go
    │       │       ├── dev_aix_ppc64.go
    │       │       ├── dev_aix_ppc.go
    │       │       ├── dev_darwin.go
    │       │       ├── dev_dragonfly.go
    │       │       ├── dev_freebsd.go
    │       │       ├── dev_linux.go
    │       │       ├── dev_netbsd.go
    │       │       ├── dev_openbsd.go
    │       │       ├── dev_zos.go
    │       │       ├── dirent.go
    │       │       ├── endian_big.go
    │       │       ├── endian_little.go
    │       │       ├── env_unix.go
    │       │       ├── fcntl_darwin.go
    │       │       ├── fcntl.go
    │       │       ├── fcntl_linux_32bit.go
    │       │       ├── fdset.go
    │       │       ├── gccgo_c.c
    │       │       ├── gccgo.go
    │       │       ├── gccgo_linux_amd64.go
    │       │       ├── ifreq_linux.go
    │       │       ├── ioctl_linux.go
    │       │       ├── ioctl_signed.go
    │       │       ├── ioctl_unsigned.go
    │       │       ├── ioctl_zos.go
    │       │       ├── mkall.sh
    │       │       ├── mkerrors.sh
    │       │       ├── mmap_nomremap.go
    │       │       ├── mremap.go
    │       │       ├── pagesize_unix.go
    │       │       ├── pledge_openbsd.go
    │       │       ├── ptrace_darwin.go
    │       │       ├── ptrace_ios.go
    │       │       ├── race0.go
    │       │       ├── race.go
    │       │       ├── readdirent_getdents.go
    │       │       ├── readdirent_getdirentries.go
    │       │       ├── README.md
    │       │       ├── readv_unix.go
    │       │       ├── sockcmsg_dragonfly.go
    │       │       ├── sockcmsg_linux.go
    │       │       ├── sockcmsg_unix.go
    │       │       ├── sockcmsg_unix_other.go
    │       │       ├── sockcmsg_zos.go
    │       │       ├── symaddr_zos_s390x.s
    │       │       ├── syscall_aix.go
    │       │       ├── syscall_aix_ppc64.go
    │       │       ├── syscall_aix_ppc.go
    │       │       ├── syscall_bsd.go
    │       │       ├── syscall_darwin_amd64.go
    │       │       ├── syscall_darwin_arm64.go
    │       │       ├── syscall_darwin.go
    │       │       ├── syscall_darwin_libSystem.go
    │       │       ├── syscall_dragonfly_amd64.go
    │       │       ├── syscall_dragonfly.go
    │       │       ├── syscall_freebsd_386.go
    │       │       ├── syscall_freebsd_amd64.go
    │       │       ├── syscall_freebsd_arm64.go
    │       │       ├── syscall_freebsd_arm.go
    │       │       ├── syscall_freebsd.go
    │       │       ├── syscall_freebsd_riscv64.go
    │       │       ├── syscall.go
    │       │       ├── syscall_hurd_386.go
    │       │       ├── syscall_hurd.go
    │       │       ├── syscall_illumos.go
    │       │       ├── syscall_linux_386.go
    │       │       ├── syscall_linux_alarm.go
    │       │       ├── syscall_linux_amd64_gc.go
    │       │       ├── syscall_linux_amd64.go
    │       │       ├── syscall_linux_arm64.go
    │       │       ├── syscall_linux_arm.go
    │       │       ├── syscall_linux_gc_386.go
    │       │       ├── syscall_linux_gc_arm.go
    │       │       ├── syscall_linux_gccgo_386.go
    │       │       ├── syscall_linux_gccgo_arm.go
    │       │       ├── syscall_linux_gc.go
    │       │       ├── syscall_linux.go
    │       │       ├── syscall_linux_loong64.go
    │       │       ├── syscall_linux_mips64x.go
    │       │       ├── syscall_linux_mipsx.go
    │       │       ├── syscall_linux_ppc64x.go
    │       │       ├── syscall_linux_ppc.go
    │       │       ├── syscall_linux_riscv64.go
    │       │       ├── syscall_linux_s390x.go
    │       │       ├── syscall_linux_sparc64.go
    │       │       ├── syscall_netbsd_386.go
    │       │       ├── syscall_netbsd_amd64.go
    │       │       ├── syscall_netbsd_arm64.go
    │       │       ├── syscall_netbsd_arm.go
    │       │       ├── syscall_netbsd.go
    │       │       ├── syscall_openbsd_386.go
    │       │       ├── syscall_openbsd_amd64.go
    │       │       ├── syscall_openbsd_arm64.go
    │       │       ├── syscall_openbsd_arm.go
    │       │       ├── syscall_openbsd.go
    │       │       ├── syscall_openbsd_libc.go
    │       │       ├── syscall_openbsd_mips64.go
    │       │       ├── syscall_openbsd_ppc64.go
    │       │       ├── syscall_openbsd_riscv64.go
    │       │       ├── syscall_solaris_amd64.go
    │       │       ├── syscall_solaris.go
    │       │       ├── syscall_unix_gc.go
    │       │       ├── syscall_unix_gc_ppc64x.go
    │       │       ├── syscall_unix.go
    │       │       ├── syscall_zos_s390x.go
    │       │       ├── sysvshm_linux.go
    │       │       ├── sysvshm_unix.go
    │       │       ├── sysvshm_unix_other.go
    │       │       ├── timestruct.go
    │       │       ├── unveil_openbsd.go
    │       │       ├── vgetrandom_linux.go
    │       │       ├── vgetrandom_unsupported.go
    │       │       ├── xattr_bsd.go
    │       │       ├── zerrors_aix_ppc64.go
    │       │       ├── zerrors_aix_ppc.go
    │       │       ├── zerrors_darwin_amd64.go
    │       │       ├── zerrors_darwin_arm64.go
    │       │       ├── zerrors_dragonfly_amd64.go
    │       │       ├── zerrors_freebsd_386.go
    │       │       ├── zerrors_freebsd_amd64.go
    │       │       ├── zerrors_freebsd_arm64.go
    │       │       ├── zerrors_freebsd_arm.go
    │       │       ├── zerrors_freebsd_riscv64.go
    │       │       ├── zerrors_linux_386.go
    │       │       ├── zerrors_linux_amd64.go
    │       │       ├── zerrors_linux_arm64.go
    │       │       ├── zerrors_linux_arm.go
    │       │       ├── zerrors_linux.go
    │       │       ├── zerrors_linux_loong64.go
    │       │       ├── zerrors_linux_mips64.go
    │       │       ├── zerrors_linux_mips64le.go
    │       │       ├── zerrors_linux_mips.go
    │       │       ├── zerrors_linux_mipsle.go
    │       │       ├── zerrors_linux_ppc64.go
    │       │       ├── zerrors_linux_ppc64le.go
    │       │       ├── zerrors_linux_ppc.go
    │       │       ├── zerrors_linux_riscv64.go
    │       │       ├── zerrors_linux_s390x.go
    │       │       ├── zerrors_linux_sparc64.go
    │       │       ├── zerrors_netbsd_386.go
    │       │       ├── zerrors_netbsd_amd64.go
    │       │       ├── zerrors_netbsd_arm64.go
    │       │       ├── zerrors_netbsd_arm.go
    │       │       ├── zerrors_openbsd_386.go
    │       │       ├── zerrors_openbsd_amd64.go
    │       │       ├── zerrors_openbsd_arm64.go
    │       │       ├── zerrors_openbsd_arm.go
    │       │       ├── zerrors_openbsd_mips64.go
    │       │       ├── zerrors_openbsd_ppc64.go
    │       │       ├── zerrors_openbsd_riscv64.go
    │       │       ├── zerrors_solaris_amd64.go
    │       │       ├── zerrors_zos_s390x.go
    │       │       ├── zptrace_armnn_linux.go
    │       │       ├── zptrace_linux_arm64.go
    │       │       ├── zptrace_mipsnnle_linux.go
    │       │       ├── zptrace_mipsnn_linux.go
    │       │       ├── zptrace_x86_linux.go
    │       │       ├── zsymaddr_zos_s390x.s
    │       │       ├── zsyscall_aix_ppc64_gccgo.go
    │       │       ├── zsyscall_aix_ppc64_gc.go
    │       │       ├── zsyscall_aix_ppc64.go
    │       │       ├── zsyscall_aix_ppc.go
    │       │       ├── zsyscall_darwin_amd64.go
    │       │       ├── zsyscall_darwin_amd64.s
    │       │       ├── zsyscall_darwin_arm64.go
    │       │       ├── zsyscall_darwin_arm64.s
    │       │       ├── zsyscall_dragonfly_amd64.go
    │       │       ├── zsyscall_freebsd_386.go
    │       │       ├── zsyscall_freebsd_amd64.go
    │       │       ├── zsyscall_freebsd_arm64.go
    │       │       ├── zsyscall_freebsd_arm.go
    │       │       ├── zsyscall_freebsd_riscv64.go
    │       │       ├── zsyscall_illumos_amd64.go
    │       │       ├── zsyscall_linux_386.go
    │       │       ├── zsyscall_linux_amd64.go
    │       │       ├── zsyscall_linux_arm64.go
    │       │       ├── zsyscall_linux_arm.go
    │       │       ├── zsyscall_linux.go
    │       │       ├── zsyscall_linux_loong64.go
    │       │       ├── zsyscall_linux_mips64.go
    │       │       ├── zsyscall_linux_mips64le.go
    │       │       ├── zsyscall_linux_mips.go
    │       │       ├── zsyscall_linux_mipsle.go
    │       │       ├── zsyscall_linux_ppc64.go
    │       │       ├── zsyscall_linux_ppc64le.go
    │       │       ├── zsyscall_linux_ppc.go
    │       │       ├── zsyscall_linux_riscv64.go
    │       │       ├── zsyscall_linux_s390x.go
    │       │       ├── zsyscall_linux_sparc64.go
    │       │       ├── zsyscall_netbsd_386.go
    │       │       ├── zsyscall_netbsd_amd64.go
    │       │       ├── zsyscall_netbsd_arm64.go
    │       │       ├── zsyscall_netbsd_arm.go
    │       │       ├── zsyscall_openbsd_386.go
    │       │       ├── zsyscall_openbsd_386.s
    │       │       ├── zsyscall_openbsd_amd64.go
    │       │       ├── zsyscall_openbsd_amd64.s
    │       │       ├── zsyscall_openbsd_arm64.go
    │       │       ├── zsyscall_openbsd_arm64.s
    │       │       ├── zsyscall_openbsd_arm.go
    │       │       ├── zsyscall_openbsd_arm.s
    │       │       ├── zsyscall_openbsd_mips64.go
    │       │       ├── zsyscall_openbsd_mips64.s
    │       │       ├── zsyscall_openbsd_ppc64.go
    │       │       ├── zsyscall_openbsd_ppc64.s
    │       │       ├── zsyscall_openbsd_riscv64.go
    │       │       ├── zsyscall_openbsd_riscv64.s
    │       │       ├── zsyscall_solaris_amd64.go
    │       │       ├── zsyscall_zos_s390x.go
    │       │       ├── zsysctl_openbsd_386.go
    │       │       ├── zsysctl_openbsd_amd64.go
    │       │       ├── zsysctl_openbsd_arm64.go
    │       │       ├── zsysctl_openbsd_arm.go
    │       │       ├── zsysctl_openbsd_mips64.go
    │       │       ├── zsysctl_openbsd_ppc64.go
    │       │       ├── zsysctl_openbsd_riscv64.go
    │       │       ├── zsysnum_darwin_amd64.go
    │       │       ├── zsysnum_darwin_arm64.go
    │       │       ├── zsysnum_dragonfly_amd64.go
    │       │       ├── zsysnum_freebsd_386.go
    │       │       ├── zsysnum_freebsd_amd64.go
    │       │       ├── zsysnum_freebsd_arm64.go
    │       │       ├── zsysnum_freebsd_arm.go
    │       │       ├── zsysnum_freebsd_riscv64.go
    │       │       ├── zsysnum_linux_386.go
    │       │       ├── zsysnum_linux_amd64.go
    │       │       ├── zsysnum_linux_arm64.go
    │       │       ├── zsysnum_linux_arm.go
    │       │       ├── zsysnum_linux_loong64.go
    │       │       ├── zsysnum_linux_mips64.go
    │       │       ├── zsysnum_linux_mips64le.go
    │       │       ├── zsysnum_linux_mips.go
    │       │       ├── zsysnum_linux_mipsle.go
    │       │       ├── zsysnum_linux_ppc64.go
    │       │       ├── zsysnum_linux_ppc64le.go
    │       │       ├── zsysnum_linux_ppc.go
    │       │       ├── zsysnum_linux_riscv64.go
    │       │       ├── zsysnum_linux_s390x.go
    │       │       ├── zsysnum_linux_sparc64.go
    │       │       ├── zsysnum_netbsd_386.go
    │       │       ├── zsysnum_netbsd_amd64.go
    │       │       ├── zsysnum_netbsd_arm64.go
    │       │       ├── zsysnum_netbsd_arm.go
    │       │       ├── zsysnum_openbsd_386.go
    │       │       ├── zsysnum_openbsd_amd64.go
    │       │       ├── zsysnum_openbsd_arm64.go
    │       │       ├── zsysnum_openbsd_arm.go
    │       │       ├── zsysnum_openbsd_mips64.go
    │       │       ├── zsysnum_openbsd_ppc64.go
    │       │       ├── zsysnum_openbsd_riscv64.go
    │       │       ├── zsysnum_zos_s390x.go
    │       │       ├── ztypes_aix_ppc64.go
    │       │       ├── ztypes_aix_ppc.go
    │       │       ├── ztypes_darwin_amd64.go
    │       │       ├── ztypes_darwin_arm64.go
    │       │       ├── ztypes_dragonfly_amd64.go
    │       │       ├── ztypes_freebsd_386.go
    │       │       ├── ztypes_freebsd_amd64.go
    │       │       ├── ztypes_freebsd_arm64.go
    │       │       ├── ztypes_freebsd_arm.go
    │       │       ├── ztypes_freebsd_riscv64.go
    │       │       ├── ztypes_linux_386.go
    │       │       ├── ztypes_linux_amd64.go
    │       │       ├── ztypes_linux_arm64.go
    │       │       ├── ztypes_linux_arm.go
    │       │       ├── ztypes_linux.go
    │       │       ├── ztypes_linux_loong64.go
    │       │       ├── ztypes_linux_mips64.go
    │       │       ├── ztypes_linux_mips64le.go
    │       │       ├── ztypes_linux_mips.go
    │       │       ├── ztypes_linux_mipsle.go
    │       │       ├── ztypes_linux_ppc64.go
    │       │       ├── ztypes_linux_ppc64le.go
    │       │       ├── ztypes_linux_ppc.go
    │       │       ├── ztypes_linux_riscv64.go
    │       │       ├── ztypes_linux_s390x.go
    │       │       ├── ztypes_linux_sparc64.go
    │       │       ├── ztypes_netbsd_386.go
    │       │       ├── ztypes_netbsd_amd64.go
    │       │       ├── ztypes_netbsd_arm64.go
    │       │       ├── ztypes_netbsd_arm.go
    │       │       ├── ztypes_openbsd_386.go
    │       │       ├── ztypes_openbsd_amd64.go
    │       │       ├── ztypes_openbsd_arm64.go
    │       │       ├── ztypes_openbsd_arm.go
    │       │       ├── ztypes_openbsd_mips64.go
    │       │       ├── ztypes_openbsd_ppc64.go
    │       │       ├── ztypes_openbsd_riscv64.go
    │       │       ├── ztypes_solaris_amd64.go
    │       │       └── ztypes_zos_s390x.go
    │       └── text
    │           ├── internal
    │           │   ├── language
    │           │   │   ├── common.go
    │           │   │   ├── compact
    │           │   │   │   ├── compact.go
    │           │   │   │   ├── language.go
    │           │   │   │   ├── parents.go
    │           │   │   │   ├── tables.go
    │           │   │   │   └── tags.go
    │           │   │   ├── compact.go
    │           │   │   ├── compose.go
    │           │   │   ├── coverage.go
    │           │   │   ├── language.go
    │           │   │   ├── lookup.go
    │           │   │   ├── match.go
    │           │   │   ├── parse.go
    │           │   │   ├── tables.go
    │           │   │   └── tags.go
    │           │   └── tag
    │           │       └── tag.go
    │           ├── language
    │           │   ├── coverage.go
    │           │   ├── doc.go
    │           │   ├── language.go
    │           │   ├── match.go
    │           │   ├── parse.go
    │           │   ├── tables.go
    │           │   └── tags.go
    │           ├── LICENSE
    │           ├── PATENTS
    │           ├── secure
    │           │   └── bidirule
    │           │       ├── bidirule10.0.0.go
    │           │       ├── bidirule9.0.0.go
    │           │       └── bidirule.go
    │           ├── transform
    │           │   └── transform.go
    │           └── unicode
    │               ├── bidi
    │               │   ├── bidi.go
    │               │   ├── bracket.go
    │               │   ├── core.go
    │               │   ├── prop.go
    │               │   ├── tables10.0.0.go
    │               │   ├── tables11.0.0.go
    │               │   ├── tables12.0.0.go
    │               │   ├── tables13.0.0.go
    │               │   ├── tables15.0.0.go
    │               │   ├── tables9.0.0.go
    │               │   └── trieval.go
    │               └── norm
    │                   ├── composition.go
    │                   ├── forminfo.go
    │                   ├── input.go
    │                   ├── iter.go
    │                   ├── normalize.go
    │                   ├── readwriter.go
    │                   ├── tables10.0.0.go
    │                   ├── tables11.0.0.go
    │                   ├── tables12.0.0.go
    │                   ├── tables13.0.0.go
    │                   ├── tables15.0.0.go
    │                   ├── tables9.0.0.go
    │                   ├── transform.go
    │                   └── trie.go
    ├── google.golang.org
    │   └── protobuf
    │       ├── encoding
    │       │   └── protowire
    │       │       └── wire.go
    │       ├── internal
    │       │   ├── detrand
    │       │   │   └── rand.go
    │       │   ├── encoding
    │       │   │   └── messageset
    │       │   │       └── messageset.go
    │       │   ├── errors
    │       │   │   └── errors.go
    │       │   ├── flags
    │       │   │   ├── flags.go
    │       │   │   ├── proto_legacy_disable.go
    │       │   │   └── proto_legacy_enable.go
    │       │   ├── genid
    │       │   │   ├── any_gen.go
    │       │   │   ├── api_gen.go
    │       │   │   ├── descriptor_gen.go
    │       │   │   ├── doc.go
    │       │   │   ├── duration_gen.go
    │       │   │   ├── empty_gen.go
    │       │   │   ├── field_mask_gen.go
    │       │   │   ├── go_features_gen.go
    │       │   │   ├── goname.go
    │       │   │   ├── map_entry.go
    │       │   │   ├── name.go
    │       │   │   ├── source_context_gen.go
    │       │   │   ├── struct_gen.go
    │       │   │   ├── timestamp_gen.go
    │       │   │   ├── type_gen.go
    │       │   │   ├── wrappers_gen.go
    │       │   │   └── wrappers.go
    │       │   ├── order
    │       │   │   ├── order.go
    │       │   │   └── range.go
    │       │   ├── pragma
    │       │   │   └── pragma.go
    │       │   └── strs
    │       │       ├── strings.go
    │       │       ├── strings_unsafe_go120.go
    │       │       └── strings_unsafe_go121.go
    │       ├── LICENSE
    │       ├── PATENTS
    │       ├── proto
    │       │   ├── checkinit.go
    │       │   ├── decode_gen.go
    │       │   ├── decode.go
    │       │   ├── doc.go
    │       │   ├── encode_gen.go
    │       │   ├── encode.go
    │       │   ├── equal.go
    │       │   ├── extension.go
    │       │   ├── merge.go
    │       │   ├── messageset.go
    │       │   ├── proto.go
    │       │   ├── proto_methods.go
    │       │   ├── proto_reflect.go
    │       │   ├── reset.go
    │       │   ├── size_gen.go
    │       │   ├── size.go
    │       │   ├── wrapperopaque.go
    │       │   └── wrappers.go
    │       ├── reflect
    │       │   ├── protoreflect
    │       │   │   ├── methods.go
    │       │   │   ├── proto.go
    │       │   │   ├── source_gen.go
    │       │   │   ├── source.go
    │       │   │   ├── type.go
    │       │   │   ├── value_equal.go
    │       │   │   ├── value.go
    │       │   │   ├── value_union.go
    │       │   │   ├── value_unsafe_go120.go
    │       │   │   └── value_unsafe_go121.go
    │       │   └── protoregistry
    │       │       └── registry.go
    │       └── runtime
    │           └── protoiface
    │               ├── legacy.go
    │               └── methods.go
    ├── gopkg.in
    │   └── yaml.v3
    │       ├── apic.go
    │       ├── decode.go
    │       ├── emitterc.go
    │       ├── encode.go
    │       ├── LICENSE
    │       ├── NOTICE
    │       ├── parserc.go
    │       ├── readerc.go
    │       ├── README.md
    │       ├── resolve.go
    │       ├── scannerc.go
    │       ├── sorter.go
    │       ├── writerc.go
    │       ├── yaml.go
    │       ├── yamlh.go
    │       └── yamlprivateh.go
    ├── go.uber.org
    │   └── atomic
    │       ├── bool_ext.go
    │       ├── bool.go
    │       ├── CHANGELOG.md
    │       ├── doc.go
    │       ├── duration_ext.go
    │       ├── duration.go
    │       ├── error_ext.go
    │       ├── error.go
    │       ├── float32_ext.go
    │       ├── float32.go
    │       ├── float64_ext.go
    │       ├── float64.go
    │       ├── gen.go
    │       ├── int32.go
    │       ├── int64.go
    │       ├── LICENSE.txt
    │       ├── Makefile
    │       ├── nocmp.go
    │       ├── pointer_go118.go
    │       ├── pointer_go118_pre119.go
    │       ├── pointer_go119.go
    │       ├── README.md
    │       ├── string_ext.go
    │       ├── string.go
    │       ├── time_ext.go
    │       ├── time.go
    │       ├── uint32.go
    │       ├── uint64.go
    │       ├── uintptr.go
    │       ├── unsafe_pointer.go
    │       └── value.go
    └── modules.txt

278 directories, 2188 files
