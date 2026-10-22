.
├── core
│   ├── gredis.go
│   ├── mari.go
│   └── ws.go
├── Dockerfile
├── go.mod
├── go.mod.bak
├── go.sum
├── go.sum.bak
├── go_vendor.tar.gz
├── index.html
├── main.go
├── manifest.yml
├── old
│   └── main.go
├── public
│   └── index.html
├── README.md
├── services
│   ├── claude
│   │   └── routes.go
│   ├── googleal
│   │   ├── routes.go
│   │   └── util.go
│   ├── mermaid
│   │   └── routes.go
│   ├── misc
│   │   ├── product.go
│   │   └── user.go
│   └── openai
│       └── routes.go
├── templates
├── test
├── tmp
│   ├── action.go
│   ├── build-errors.log
│   └── main
├── tree.md
├── trre.txt
└── vendor
    ├── cloud.google.com
    │   └── go
    │       ├── ai
    │       │   ├── generativelanguage
    │       │   │   └── apiv1beta
    │       │   │       ├── auxiliary.go
    │       │   │       ├── auxiliary_go123.go
    │       │   │       ├── cache_client.go
    │       │   │       ├── discuss_client.go
    │       │   │       ├── doc.go
    │       │   │       ├── file_client.go
    │       │   │       ├── gapic_metadata.json
    │       │   │       ├── generative_client.go
    │       │   │       ├── generativelanguagepb
    │       │   │       │   ├── cached_content.pb.go
    │       │   │       │   ├── cache_service.pb.go
    │       │   │       │   ├── citation.pb.go
    │       │   │       │   ├── content.pb.go
    │       │   │       │   ├── discuss_service.pb.go
    │       │   │       │   ├── file.pb.go
    │       │   │       │   ├── file_service.pb.go
    │       │   │       │   ├── generative_service.pb.go
    │       │   │       │   ├── model.pb.go
    │       │   │       │   ├── model_service.pb.go
    │       │   │       │   ├── permission.pb.go
    │       │   │       │   ├── permission_service.pb.go
    │       │   │       │   ├── prediction_service.pb.go
    │       │   │       │   ├── retriever.pb.go
    │       │   │       │   ├── retriever_service.pb.go
    │       │   │       │   ├── safety.pb.go
    │       │   │       │   ├── text_service.pb.go
    │       │   │       │   └── tuned_model.pb.go
    │       │   │       ├── helpers.go
    │       │   │       ├── info.go
    │       │   │       ├── model_client.go
    │       │   │       ├── permission_client.go
    │       │   │       ├── prediction_client.go
    │       │   │       ├── retriever_client.go
    │       │   │       ├── text_client.go
    │       │   │       └── version.go
    │       │   ├── internal
    │       │   │   └── version.go
    │       │   └── LICENSE
    │       ├── auth
    │       │   ├── auth.go
    │       │   ├── CHANGES.md
    │       │   ├── credentials
    │       │   │   ├── compute.go
    │       │   │   ├── detect.go
    │       │   │   ├── doc.go
    │       │   │   ├── filetypes.go
    │       │   │   ├── internal
    │       │   │   │   ├── externalaccount
    │       │   │   │   │   ├── aws_provider.go
    │       │   │   │   │   ├── executable_provider.go
    │       │   │   │   │   ├── externalaccount.go
    │       │   │   │   │   ├── file_provider.go
    │       │   │   │   │   ├── info.go
    │       │   │   │   │   ├── programmatic_provider.go
    │       │   │   │   │   ├── url_provider.go
    │       │   │   │   │   └── x509_provider.go
    │       │   │   │   ├── externalaccountuser
    │       │   │   │   │   └── externalaccountuser.go
    │       │   │   │   ├── gdch
    │       │   │   │   │   └── gdch.go
    │       │   │   │   ├── impersonate
    │       │   │   │   │   ├── idtoken.go
    │       │   │   │   │   └── impersonate.go
    │       │   │   │   └── stsexchange
    │       │   │   │       └── sts_exchange.go
    │       │   │   └── selfsignedjwt.go
    │       │   ├── grpctransport
    │       │   │   ├── dial_socketopt.go
    │       │   │   ├── directpath.go
    │       │   │   ├── grpctransport.go
    │       │   │   └── pool.go
    │       │   ├── httptransport
    │       │   │   ├── httptransport.go
    │       │   │   └── transport.go
    │       │   ├── internal
    │       │   │   ├── compute
    │       │   │   │   ├── compute.go
    │       │   │   │   ├── manufacturer.go
    │       │   │   │   ├── manufacturer_linux.go
    │       │   │   │   └── manufacturer_windows.go
    │       │   │   ├── credsfile
    │       │   │   │   ├── credsfile.go
    │       │   │   │   ├── filetype.go
    │       │   │   │   └── parse.go
    │       │   │   ├── internal.go
    │       │   │   ├── jwt
    │       │   │   │   └── jwt.go
    │       │   │   └── transport
    │       │   │       ├── cba.go
    │       │   │       ├── cert
    │       │   │       │   ├── default_cert.go
    │       │   │       │   ├── enterprise_cert.go
    │       │   │       │   ├── secureconnect_cert.go
    │       │   │       │   └── workload_cert.go
    │       │   │       ├── s2a.go
    │       │   │       └── transport.go
    │       │   ├── LICENSE
    │       │   ├── oauth2adapt
    │       │   │   ├── CHANGES.md
    │       │   │   ├── LICENSE
    │       │   │   └── oauth2adapt.go
    │       │   ├── README.md
    │       │   └── threelegged.go
    │       ├── CHANGES.md
    │       ├── CODE_OF_CONDUCT.md
    │       ├── compute
    │       │   └── metadata
    │       │       ├── CHANGES.md
    │       │       ├── LICENSE
    │       │       ├── log.go
    │       │       ├── metadata.go
    │       │       ├── README.md
    │       │       ├── retry.go
    │       │       ├── retry_linux.go
    │       │       ├── syscheck.go
    │       │       ├── syscheck_linux.go
    │       │       └── syscheck_windows.go
    │       ├── CONTRIBUTING.md
    │       ├── debug.md
    │       ├── doc.go
    │       ├── go.work
    │       ├── go.work.sum
    │       ├── LICENSE
    │       ├── longrunning
    │       │   ├── autogen
    │       │   │   ├── auxiliary.go
    │       │   │   ├── auxiliary_go123.go
    │       │   │   ├── doc.go
    │       │   │   ├── from_conn.go
    │       │   │   ├── gapic_metadata.json
    │       │   │   ├── helpers.go
    │       │   │   ├── info.go
    │       │   │   ├── longrunningpb
    │       │   │   │   └── operations.pb.go
    │       │   │   └── operations_client.go
    │       │   ├── CHANGES.md
    │       │   ├── LICENSE
    │       │   ├── longrunning.go
    │       │   ├── README.md
    │       │   └── tidyfix.go
    │       ├── migration.md
    │       ├── README.md
    │       ├── release-please-config-individual.json
    │       ├── release-please-config.json
    │       ├── release-please-config-yoshi-submodules.json
    │       ├── RELEASING.md
    │       ├── SECURITY.md
    │       └── testing.md
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
    │   ├── dgryski
    │   │   └── go-rendezvous
    │   │       ├── LICENSE
    │   │       └── rdv.go
    │   ├── felixge
    │   │   └── httpsnoop
    │   │       ├── capture_metrics.go
    │   │       ├── docs.go
    │   │       ├── LICENSE.txt
    │   │       ├── Makefile
    │   │       ├── README.md
    │   │       ├── wrap_generated_gteq_1.8.go
    │   │       └── wrap_generated_lt_1.8.go
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
    │   ├── go-logr
    │   │   ├── logr
    │   │   │   ├── CHANGELOG.md
    │   │   │   ├── context.go
    │   │   │   ├── context_noslog.go
    │   │   │   ├── context_slog.go
    │   │   │   ├── CONTRIBUTING.md
    │   │   │   ├── discard.go
    │   │   │   ├── funcr
    │   │   │   │   ├── funcr.go
    │   │   │   │   └── slogsink.go
    │   │   │   ├── LICENSE
    │   │   │   ├── logr.go
    │   │   │   ├── README.md
    │   │   │   ├── SECURITY.md
    │   │   │   ├── sloghandler.go
    │   │   │   ├── slogr.go
    │   │   │   └── slogsink.go
    │   │   └── stdr
    │   │       ├── LICENSE
    │   │       ├── README.md
    │   │       └── stdr.go
    │   ├── google
    │   │   ├── generative-ai-go
    │   │   │   ├── genai
    │   │   │   │   ├── caching.go
    │   │   │   │   ├── chat.go
    │   │   │   │   ├── client.go
    │   │   │   │   ├── config.yaml
    │   │   │   │   ├── content.go
    │   │   │   │   ├── debug.go
    │   │   │   │   ├── doc.go
    │   │   │   │   ├── embed.go
    │   │   │   │   ├── files.go
    │   │   │   │   ├── generate.sh
    │   │   │   │   ├── generativelanguagepb_veneer.gen.go
    │   │   │   │   ├── internal
    │   │   │   │   │   ├── generativelanguage
    │   │   │   │   │   │   └── v1beta
    │   │   │   │   │   │       ├── generativelanguage-api.json
    │   │   │   │   │   │       └── generativelanguage-gen.go
    │   │   │   │   │   ├── gensupport
    │   │   │   │   │   │   ├── buffer.go
    │   │   │   │   │   │   ├── doc.go
    │   │   │   │   │   │   ├── error.go
    │   │   │   │   │   │   ├── jsonfloat.go
    │   │   │   │   │   │   ├── json.go
    │   │   │   │   │   │   ├── media.go
    │   │   │   │   │   │   ├── params.go
    │   │   │   │   │   │   ├── README
    │   │   │   │   │   │   ├── resumable.go
    │   │   │   │   │   │   ├── retryable_linux.go
    │   │   │   │   │   │   ├── retry.go
    │   │   │   │   │   │   ├── send.go
    │   │   │   │   │   │   └── version.go
    │   │   │   │   │   └── version.go
    │   │   │   │   ├── license.txt
    │   │   │   │   ├── list_models.go
    │   │   │   │   └── option.go
    │   │   │   └── LICENSE
    │   │   ├── s2a-go
    │   │   │   ├── CODE_OF_CONDUCT.md
    │   │   │   ├── CONTRIBUTING.md
    │   │   │   ├── fallback
    │   │   │   │   └── s2a_fallback.go
    │   │   │   ├── internal
    │   │   │   │   ├── authinfo
    │   │   │   │   │   └── authinfo.go
    │   │   │   │   ├── handshaker
    │   │   │   │   │   ├── handshaker.go
    │   │   │   │   │   └── service
    │   │   │   │   │       └── service.go
    │   │   │   │   ├── proto
    │   │   │   │   │   ├── common_go_proto
    │   │   │   │   │   │   └── common.pb.go
    │   │   │   │   │   ├── s2a_context_go_proto
    │   │   │   │   │   │   └── s2a_context.pb.go
    │   │   │   │   │   ├── s2a_go_proto
    │   │   │   │   │   │   ├── s2a_grpc.pb.go
    │   │   │   │   │   │   └── s2a.pb.go
    │   │   │   │   │   └── v2
    │   │   │   │   │       ├── common_go_proto
    │   │   │   │   │       │   └── common.pb.go
    │   │   │   │   │       ├── s2a_context_go_proto
    │   │   │   │   │       │   └── s2a_context.pb.go
    │   │   │   │   │       └── s2a_go_proto
    │   │   │   │   │           ├── s2a_grpc.pb.go
    │   │   │   │   │           └── s2a.pb.go
    │   │   │   │   ├── record
    │   │   │   │   │   ├── internal
    │   │   │   │   │   │   ├── aeadcrypter
    │   │   │   │   │   │   │   ├── aeadcrypter.go
    │   │   │   │   │   │   │   ├── aesgcm.go
    │   │   │   │   │   │   │   ├── chachapoly.go
    │   │   │   │   │   │   │   └── common.go
    │   │   │   │   │   │   └── halfconn
    │   │   │   │   │   │       ├── ciphersuite.go
    │   │   │   │   │   │       ├── counter.go
    │   │   │   │   │   │       ├── expander.go
    │   │   │   │   │   │       └── halfconn.go
    │   │   │   │   │   ├── record.go
    │   │   │   │   │   └── ticketsender.go
    │   │   │   │   ├── tokenmanager
    │   │   │   │   │   └── tokenmanager.go
    │   │   │   │   └── v2
    │   │   │   │       ├── certverifier
    │   │   │   │       │   └── certverifier.go
    │   │   │   │       ├── README.md
    │   │   │   │       ├── remotesigner
    │   │   │   │       │   └── remotesigner.go
    │   │   │   │       ├── s2av2.go
    │   │   │   │       └── tlsconfigstore
    │   │   │   │           └── tlsconfigstore.go
    │   │   │   ├── LICENSE.md
    │   │   │   ├── README.md
    │   │   │   ├── retry
    │   │   │   │   └── retry.go
    │   │   │   ├── s2a.go
    │   │   │   ├── s2a_options.go
    │   │   │   ├── s2a_utils.go
    │   │   │   └── stream
    │   │   │       └── s2a_stream.go
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
    │   ├── googleapis
    │   │   ├── enterprise-certificate-proxy
    │   │   │   ├── client
    │   │   │   │   ├── client.go
    │   │   │   │   └── util
    │   │   │   │       └── util.go
    │   │   │   └── LICENSE
    │   │   └── gax-go
    │   │       └── v2
    │   │           ├── apierror
    │   │           │   ├── apierror.go
    │   │           │   └── internal
    │   │           │       └── proto
    │   │           │           ├── custom_error.pb.go
    │   │           │           ├── custom_error.proto
    │   │           │           ├── error.pb.go
    │   │           │           ├── error.proto
    │   │           │           └── README.md
    │   │           ├── callctx
    │   │           │   └── callctx.go
    │   │           ├── call_option.go
    │   │           ├── CHANGES.md
    │   │           ├── content_type.go
    │   │           ├── gax.go
    │   │           ├── header.go
    │   │           ├── internal
    │   │           │   └── version.go
    │   │           ├── internallog
    │   │           │   ├── grpclog
    │   │           │   │   └── grpclog.go
    │   │           │   ├── internal
    │   │           │   │   └── internal.go
    │   │           │   └── internallog.go
    │   │           ├── invoke.go
    │   │           ├── iterator
    │   │           │   └── iterator.go
    │   │           ├── LICENSE
    │   │           ├── proto_json_stream.go
    │   │           └── release-please-config.json
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
    │   ├── go-redis
    │   │   └── redis
    │   │       └── v8
    │   │           ├── CHANGELOG.md
    │   │           ├── cluster_commands.go
    │   │           ├── cluster.go
    │   │           ├── command.go
    │   │           ├── commands.go
    │   │           ├── doc.go
    │   │           ├── error.go
    │   │           ├── internal
    │   │           │   ├── arg.go
    │   │           │   ├── hashtag
    │   │           │   │   └── hashtag.go
    │   │           │   ├── hscan
    │   │           │   │   ├── hscan.go
    │   │           │   │   └── structmap.go
    │   │           │   ├── internal.go
    │   │           │   ├── log.go
    │   │           │   ├── once.go
    │   │           │   ├── pool
    │   │           │   │   ├── conn.go
    │   │           │   │   ├── pool.go
    │   │           │   │   ├── pool_single.go
    │   │           │   │   └── pool_sticky.go
    │   │           │   ├── proto
    │   │           │   │   ├── reader.go
    │   │           │   │   ├── scan.go
    │   │           │   │   └── writer.go
    │   │           │   ├── rand
    │   │           │   │   └── rand.go
    │   │           │   ├── safe.go
    │   │           │   ├── unsafe.go
    │   │           │   ├── util
    │   │           │   │   ├── safe.go
    │   │           │   │   ├── strconv.go
    │   │           │   │   └── unsafe.go
    │   │           │   └── util.go
    │   │           ├── iterator.go
    │   │           ├── LICENSE
    │   │           ├── Makefile
    │   │           ├── options.go
    │   │           ├── package.json
    │   │           ├── pipeline.go
    │   │           ├── pubsub.go
    │   │           ├── README.md
    │   │           ├── redis.go
    │   │           ├── RELEASING.md
    │   │           ├── result.go
    │   │           ├── ring.go
    │   │           ├── script.go
    │   │           ├── sentinel.go
    │   │           ├── tx.go
    │   │           ├── universal.go
    │   │           └── version.go
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
    │   │           ├── detect_ref.go
    │   │           ├── detect_x86.go
    │   │           ├── featureid_string.go
    │   │           ├── LICENSE
    │   │           ├── os_darwin_arm64.go
    │   │           ├── os_linux_arm64.go
    │   │           ├── os_other_arm64.go
    │   │           ├── os_safe_linux_arm64.go
    │   │           ├── os_unsafe_linux_arm64.go
    │   │           ├── README.md
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
    │   ├── sashabaranov
    │   │   └── go-openai
    │   │       ├── assistant.go
    │   │       ├── audio.go
    │   │       ├── batch.go
    │   │       ├── chat.go
    │   │       ├── chat_stream.go
    │   │       ├── client.go
    │   │       ├── common.go
    │   │       ├── completion.go
    │   │       ├── config.go
    │   │       ├── CONTRIBUTING.md
    │   │       ├── edits.go
    │   │       ├── embeddings.go
    │   │       ├── engines.go
    │   │       ├── error.go
    │   │       ├── files.go
    │   │       ├── fine_tunes.go
    │   │       ├── fine_tuning_job.go
    │   │       ├── image.go
    │   │       ├── internal
    │   │       │   ├── error_accumulator.go
    │   │       │   ├── form_builder.go
    │   │       │   ├── marshaller.go
    │   │       │   ├── request_builder.go
    │   │       │   └── unmarshaler.go
    │   │       ├── LICENSE
    │   │       ├── messages.go
    │   │       ├── models.go
    │   │       ├── moderation.go
    │   │       ├── ratelimit.go
    │   │       ├── README.md
    │   │       ├── run.go
    │   │       ├── speech.go
    │   │       ├── stream.go
    │   │       ├── stream_reader.go
    │   │       ├── thread.go
    │   │       └── vector_store.go
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
    │   └── ugorji
    │       └── go
    │           └── codec
    │               ├── 0_importpath.go
    │               ├── binc.go
    │               ├── build.sh
    │               ├── cbor.go
    │               ├── codecgen.go
    │               ├── decimal.go
    │               ├── decode.go
    │               ├── doc.go
    │               ├── encode.go
    │               ├── fast-path.generated.go
    │               ├── fast-path.go.tmpl
    │               ├── fast-path.not.go
    │               ├── gen-dec-array.go.tmpl
    │               ├── gen-dec-map.go.tmpl
    │               ├── gen-enc-chan.go.tmpl
    │               ├── gen.generated.go
    │               ├── gen.go
    │               ├── gen-helper.generated.go
    │               ├── gen-helper.go.tmpl
    │               ├── goversion_arrayof_gte_go15.go
    │               ├── goversion_arrayof_lt_go15.go
    │               ├── goversion_fmt_time_gte_go15.go
    │               ├── goversion_fmt_time_lt_go15.go
    │               ├── goversion_growslice_unsafe_gte_go120.go
    │               ├── goversion_growslice_unsafe_lt_go120.go
    │               ├── goversion_makemap_lt_go110.go
    │               ├── goversion_makemap_not_unsafe_gte_go110.go
    │               ├── goversion_makemap_unsafe_gte_go110.go
    │               ├── goversion_maprange_gte_go112.go
    │               ├── goversion_maprange_lt_go112.go
    │               ├── goversion_unexportedembeddedptr_gte_go110.go
    │               ├── goversion_unexportedembeddedptr_lt_go110.go
    │               ├── goversion_unsupported_lt_go14.go
    │               ├── goversion_vendor_eq_go15.go
    │               ├── goversion_vendor_eq_go16.go
    │               ├── goversion_vendor_gte_go17.go
    │               ├── goversion_vendor_lt_go15.go
    │               ├── helper.go
    │               ├── helper_internal.go
    │               ├── helper_not_unsafe.go
    │               ├── helper_not_unsafe_not_gc.go
    │               ├── helper.s
    │               ├── helper_unsafe_compiler_gc.go
    │               ├── helper_unsafe_compiler_not_gc.go
    │               ├── helper_unsafe.go
    │               ├── json.go
    │               ├── LICENSE
    │               ├── mammoth2-test.go.tmpl
    │               ├── mammoth-test.go.tmpl
    │               ├── msgpack.go
    │               ├── reader.go
    │               ├── README.md
    │               ├── register_ext.go
    │               ├── rpc.go
    │               ├── simple.go
    │               ├── sort-slice.generated.go
    │               ├── sort-slice.go.tmpl
    │               ├── test-cbor-goldens.json
    │               ├── test.py
    │               └── writer.go
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
    │       │   ├── chacha20
    │       │   │   ├── chacha_arm64.go
    │       │   │   ├── chacha_arm64.s
    │       │   │   ├── chacha_generic.go
    │       │   │   ├── chacha_noasm.go
    │       │   │   ├── chacha_ppc64x.go
    │       │   │   ├── chacha_ppc64x.s
    │       │   │   ├── chacha_s390x.go
    │       │   │   ├── chacha_s390x.s
    │       │   │   └── xor.go
    │       │   ├── chacha20poly1305
    │       │   │   ├── chacha20poly1305_amd64.go
    │       │   │   ├── chacha20poly1305_amd64.s
    │       │   │   ├── chacha20poly1305_generic.go
    │       │   │   ├── chacha20poly1305.go
    │       │   │   ├── chacha20poly1305_noasm.go
    │       │   │   └── xchacha20poly1305.go
    │       │   ├── cryptobyte
    │       │   │   ├── asn1
    │       │   │   │   └── asn1.go
    │       │   │   ├── asn1.go
    │       │   │   ├── builder.go
    │       │   │   └── string.go
    │       │   ├── hkdf
    │       │   │   └── hkdf.go
    │       │   ├── internal
    │       │   │   ├── alias
    │       │   │   │   ├── alias.go
    │       │   │   │   └── alias_purego.go
    │       │   │   └── poly1305
    │       │   │       ├── mac_noasm.go
    │       │   │       ├── poly1305.go
    │       │   │       ├── sum_amd64.go
    │       │   │       ├── sum_amd64.s
    │       │   │       ├── sum_generic.go
    │       │   │       ├── sum_ppc64x.go
    │       │   │       ├── sum_ppc64x.s
    │       │   │       ├── sum_s390x.go
    │       │   │       └── sum_s390x.s
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
    │       │   │   ├── headermap.go
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
    │       │   │   └── timeseries
    │       │   │       └── timeseries.go
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   └── trace
    │       │       ├── events.go
    │       │       ├── histogram.go
    │       │       └── trace.go
    │       ├── oauth2
    │       │   ├── authhandler
    │       │   │   └── authhandler.go
    │       │   ├── CONTRIBUTING.md
    │       │   ├── deviceauth.go
    │       │   ├── google
    │       │   │   ├── appengine.go
    │       │   │   ├── default.go
    │       │   │   ├── doc.go
    │       │   │   ├── error.go
    │       │   │   ├── externalaccount
    │       │   │   │   ├── aws.go
    │       │   │   │   ├── basecredentials.go
    │       │   │   │   ├── executablecredsource.go
    │       │   │   │   ├── filecredsource.go
    │       │   │   │   ├── header.go
    │       │   │   │   ├── programmaticrefreshcredsource.go
    │       │   │   │   └── urlcredsource.go
    │       │   │   ├── google.go
    │       │   │   ├── internal
    │       │   │   │   ├── externalaccountauthorizeduser
    │       │   │   │   │   └── externalaccountauthorizeduser.go
    │       │   │   │   ├── impersonate
    │       │   │   │   │   └── impersonate.go
    │       │   │   │   └── stsexchange
    │       │   │   │       ├── clientauth.go
    │       │   │   │       └── sts_exchange.go
    │       │   │   ├── jwt.go
    │       │   │   └── sdk.go
    │       │   ├── internal
    │       │   │   ├── doc.go
    │       │   │   ├── oauth2.go
    │       │   │   ├── token.go
    │       │   │   └── transport.go
    │       │   ├── jws
    │       │   │   └── jws.go
    │       │   ├── jwt
    │       │   │   └── jwt.go
    │       │   ├── LICENSE
    │       │   ├── oauth2.go
    │       │   ├── pkce.go
    │       │   ├── README.md
    │       │   ├── token.go
    │       │   └── transport.go
    │       ├── sync
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   └── semaphore
    │       │       └── semaphore.go
    │       ├── sys
    │       │   ├── cpu
    │       │   │   ├── asm_aix_ppc64.s
    │       │   │   ├── asm_darwin_x86_gc.s
    │       │   │   ├── byteorder.go
    │       │   │   ├── cpu_aix.go
    │       │   │   ├── cpu_arm64.go
    │       │   │   ├── cpu_arm64.s
    │       │   │   ├── cpu_arm.go
    │       │   │   ├── cpu_darwin_x86.go
    │       │   │   ├── cpu_gc_arm64.go
    │       │   │   ├── cpu_gccgo_arm64.go
    │       │   │   ├── cpu_gccgo_s390x.go
    │       │   │   ├── cpu_gccgo_x86.c
    │       │   │   ├── cpu_gccgo_x86.go
    │       │   │   ├── cpu_gc_s390x.go
    │       │   │   ├── cpu_gc_x86.go
    │       │   │   ├── cpu_gc_x86.s
    │       │   │   ├── cpu.go
    │       │   │   ├── cpu_linux_arm64.go
    │       │   │   ├── cpu_linux_arm.go
    │       │   │   ├── cpu_linux.go
    │       │   │   ├── cpu_linux_mips64x.go
    │       │   │   ├── cpu_linux_noinit.go
    │       │   │   ├── cpu_linux_ppc64x.go
    │       │   │   ├── cpu_linux_riscv64.go
    │       │   │   ├── cpu_linux_s390x.go
    │       │   │   ├── cpu_loong64.go
    │       │   │   ├── cpu_mips64x.go
    │       │   │   ├── cpu_mipsx.go
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
    │       │   │   ├── cpu_s390x.go
    │       │   │   ├── cpu_s390x.s
    │       │   │   ├── cpu_wasm.go
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
    │       │   │   └── syscall_darwin_x86_gc.go
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   ├── unix
    │       │   │   ├── affinity_linux.go
    │       │   │   ├── aliases.go
    │       │   │   ├── asm_aix_ppc64.s
    │       │   │   ├── asm_bsd_386.s
    │       │   │   ├── asm_bsd_amd64.s
    │       │   │   ├── asm_bsd_arm64.s
    │       │   │   ├── asm_bsd_arm.s
    │       │   │   ├── asm_bsd_ppc64.s
    │       │   │   ├── asm_bsd_riscv64.s
    │       │   │   ├── asm_linux_386.s
    │       │   │   ├── asm_linux_amd64.s
    │       │   │   ├── asm_linux_arm64.s
    │       │   │   ├── asm_linux_arm.s
    │       │   │   ├── asm_linux_loong64.s
    │       │   │   ├── asm_linux_mips64x.s
    │       │   │   ├── asm_linux_mipsx.s
    │       │   │   ├── asm_linux_ppc64x.s
    │       │   │   ├── asm_linux_riscv64.s
    │       │   │   ├── asm_linux_s390x.s
    │       │   │   ├── asm_openbsd_mips64.s
    │       │   │   ├── asm_solaris_amd64.s
    │       │   │   ├── asm_zos_s390x.s
    │       │   │   ├── auxv.go
    │       │   │   ├── auxv_unsupported.go
    │       │   │   ├── bluetooth_linux.go
    │       │   │   ├── bpxsvc_zos.go
    │       │   │   ├── bpxsvc_zos.s
    │       │   │   ├── cap_freebsd.go
    │       │   │   ├── constants.go
    │       │   │   ├── dev_aix_ppc64.go
    │       │   │   ├── dev_aix_ppc.go
    │       │   │   ├── dev_darwin.go
    │       │   │   ├── dev_dragonfly.go
    │       │   │   ├── dev_freebsd.go
    │       │   │   ├── dev_linux.go
    │       │   │   ├── dev_netbsd.go
    │       │   │   ├── dev_openbsd.go
    │       │   │   ├── dev_zos.go
    │       │   │   ├── dirent.go
    │       │   │   ├── endian_big.go
    │       │   │   ├── endian_little.go
    │       │   │   ├── env_unix.go
    │       │   │   ├── fcntl_darwin.go
    │       │   │   ├── fcntl.go
    │       │   │   ├── fcntl_linux_32bit.go
    │       │   │   ├── fdset.go
    │       │   │   ├── gccgo_c.c
    │       │   │   ├── gccgo.go
    │       │   │   ├── gccgo_linux_amd64.go
    │       │   │   ├── ifreq_linux.go
    │       │   │   ├── ioctl_linux.go
    │       │   │   ├── ioctl_signed.go
    │       │   │   ├── ioctl_unsigned.go
    │       │   │   ├── ioctl_zos.go
    │       │   │   ├── mkall.sh
    │       │   │   ├── mkerrors.sh
    │       │   │   ├── mmap_nomremap.go
    │       │   │   ├── mremap.go
    │       │   │   ├── pagesize_unix.go
    │       │   │   ├── pledge_openbsd.go
    │       │   │   ├── ptrace_darwin.go
    │       │   │   ├── ptrace_ios.go
    │       │   │   ├── race0.go
    │       │   │   ├── race.go
    │       │   │   ├── readdirent_getdents.go
    │       │   │   ├── readdirent_getdirentries.go
    │       │   │   ├── README.md
    │       │   │   ├── sockcmsg_dragonfly.go
    │       │   │   ├── sockcmsg_linux.go
    │       │   │   ├── sockcmsg_unix.go
    │       │   │   ├── sockcmsg_unix_other.go
    │       │   │   ├── sockcmsg_zos.go
    │       │   │   ├── symaddr_zos_s390x.s
    │       │   │   ├── syscall_aix.go
    │       │   │   ├── syscall_aix_ppc64.go
    │       │   │   ├── syscall_aix_ppc.go
    │       │   │   ├── syscall_bsd.go
    │       │   │   ├── syscall_darwin_amd64.go
    │       │   │   ├── syscall_darwin_arm64.go
    │       │   │   ├── syscall_darwin.go
    │       │   │   ├── syscall_darwin_libSystem.go
    │       │   │   ├── syscall_dragonfly_amd64.go
    │       │   │   ├── syscall_dragonfly.go
    │       │   │   ├── syscall_freebsd_386.go
    │       │   │   ├── syscall_freebsd_amd64.go
    │       │   │   ├── syscall_freebsd_arm64.go
    │       │   │   ├── syscall_freebsd_arm.go
    │       │   │   ├── syscall_freebsd.go
    │       │   │   ├── syscall_freebsd_riscv64.go
    │       │   │   ├── syscall.go
    │       │   │   ├── syscall_hurd_386.go
    │       │   │   ├── syscall_hurd.go
    │       │   │   ├── syscall_illumos.go
    │       │   │   ├── syscall_linux_386.go
    │       │   │   ├── syscall_linux_alarm.go
    │       │   │   ├── syscall_linux_amd64_gc.go
    │       │   │   ├── syscall_linux_amd64.go
    │       │   │   ├── syscall_linux_arm64.go
    │       │   │   ├── syscall_linux_arm.go
    │       │   │   ├── syscall_linux_gc_386.go
    │       │   │   ├── syscall_linux_gc_arm.go
    │       │   │   ├── syscall_linux_gccgo_386.go
    │       │   │   ├── syscall_linux_gccgo_arm.go
    │       │   │   ├── syscall_linux_gc.go
    │       │   │   ├── syscall_linux.go
    │       │   │   ├── syscall_linux_loong64.go
    │       │   │   ├── syscall_linux_mips64x.go
    │       │   │   ├── syscall_linux_mipsx.go
    │       │   │   ├── syscall_linux_ppc64x.go
    │       │   │   ├── syscall_linux_ppc.go
    │       │   │   ├── syscall_linux_riscv64.go
    │       │   │   ├── syscall_linux_s390x.go
    │       │   │   ├── syscall_linux_sparc64.go
    │       │   │   ├── syscall_netbsd_386.go
    │       │   │   ├── syscall_netbsd_amd64.go
    │       │   │   ├── syscall_netbsd_arm64.go
    │       │   │   ├── syscall_netbsd_arm.go
    │       │   │   ├── syscall_netbsd.go
    │       │   │   ├── syscall_openbsd_386.go
    │       │   │   ├── syscall_openbsd_amd64.go
    │       │   │   ├── syscall_openbsd_arm64.go
    │       │   │   ├── syscall_openbsd_arm.go
    │       │   │   ├── syscall_openbsd.go
    │       │   │   ├── syscall_openbsd_libc.go
    │       │   │   ├── syscall_openbsd_mips64.go
    │       │   │   ├── syscall_openbsd_ppc64.go
    │       │   │   ├── syscall_openbsd_riscv64.go
    │       │   │   ├── syscall_solaris_amd64.go
    │       │   │   ├── syscall_solaris.go
    │       │   │   ├── syscall_unix_gc.go
    │       │   │   ├── syscall_unix_gc_ppc64x.go
    │       │   │   ├── syscall_unix.go
    │       │   │   ├── syscall_zos_s390x.go
    │       │   │   ├── sysvshm_linux.go
    │       │   │   ├── sysvshm_unix.go
    │       │   │   ├── sysvshm_unix_other.go
    │       │   │   ├── timestruct.go
    │       │   │   ├── unveil_openbsd.go
    │       │   │   ├── vgetrandom_linux.go
    │       │   │   ├── vgetrandom_unsupported.go
    │       │   │   ├── xattr_bsd.go
    │       │   │   ├── zerrors_aix_ppc64.go
    │       │   │   ├── zerrors_aix_ppc.go
    │       │   │   ├── zerrors_darwin_amd64.go
    │       │   │   ├── zerrors_darwin_arm64.go
    │       │   │   ├── zerrors_dragonfly_amd64.go
    │       │   │   ├── zerrors_freebsd_386.go
    │       │   │   ├── zerrors_freebsd_amd64.go
    │       │   │   ├── zerrors_freebsd_arm64.go
    │       │   │   ├── zerrors_freebsd_arm.go
    │       │   │   ├── zerrors_freebsd_riscv64.go
    │       │   │   ├── zerrors_linux_386.go
    │       │   │   ├── zerrors_linux_amd64.go
    │       │   │   ├── zerrors_linux_arm64.go
    │       │   │   ├── zerrors_linux_arm.go
    │       │   │   ├── zerrors_linux.go
    │       │   │   ├── zerrors_linux_loong64.go
    │       │   │   ├── zerrors_linux_mips64.go
    │       │   │   ├── zerrors_linux_mips64le.go
    │       │   │   ├── zerrors_linux_mips.go
    │       │   │   ├── zerrors_linux_mipsle.go
    │       │   │   ├── zerrors_linux_ppc64.go
    │       │   │   ├── zerrors_linux_ppc64le.go
    │       │   │   ├── zerrors_linux_ppc.go
    │       │   │   ├── zerrors_linux_riscv64.go
    │       │   │   ├── zerrors_linux_s390x.go
    │       │   │   ├── zerrors_linux_sparc64.go
    │       │   │   ├── zerrors_netbsd_386.go
    │       │   │   ├── zerrors_netbsd_amd64.go
    │       │   │   ├── zerrors_netbsd_arm64.go
    │       │   │   ├── zerrors_netbsd_arm.go
    │       │   │   ├── zerrors_openbsd_386.go
    │       │   │   ├── zerrors_openbsd_amd64.go
    │       │   │   ├── zerrors_openbsd_arm64.go
    │       │   │   ├── zerrors_openbsd_arm.go
    │       │   │   ├── zerrors_openbsd_mips64.go
    │       │   │   ├── zerrors_openbsd_ppc64.go
    │       │   │   ├── zerrors_openbsd_riscv64.go
    │       │   │   ├── zerrors_solaris_amd64.go
    │       │   │   ├── zerrors_zos_s390x.go
    │       │   │   ├── zptrace_armnn_linux.go
    │       │   │   ├── zptrace_linux_arm64.go
    │       │   │   ├── zptrace_mipsnnle_linux.go
    │       │   │   ├── zptrace_mipsnn_linux.go
    │       │   │   ├── zptrace_x86_linux.go
    │       │   │   ├── zsymaddr_zos_s390x.s
    │       │   │   ├── zsyscall_aix_ppc64_gccgo.go
    │       │   │   ├── zsyscall_aix_ppc64_gc.go
    │       │   │   ├── zsyscall_aix_ppc64.go
    │       │   │   ├── zsyscall_aix_ppc.go
    │       │   │   ├── zsyscall_darwin_amd64.go
    │       │   │   ├── zsyscall_darwin_amd64.s
    │       │   │   ├── zsyscall_darwin_arm64.go
    │       │   │   ├── zsyscall_darwin_arm64.s
    │       │   │   ├── zsyscall_dragonfly_amd64.go
    │       │   │   ├── zsyscall_freebsd_386.go
    │       │   │   ├── zsyscall_freebsd_amd64.go
    │       │   │   ├── zsyscall_freebsd_arm64.go
    │       │   │   ├── zsyscall_freebsd_arm.go
    │       │   │   ├── zsyscall_freebsd_riscv64.go
    │       │   │   ├── zsyscall_illumos_amd64.go
    │       │   │   ├── zsyscall_linux_386.go
    │       │   │   ├── zsyscall_linux_amd64.go
    │       │   │   ├── zsyscall_linux_arm64.go
    │       │   │   ├── zsyscall_linux_arm.go
    │       │   │   ├── zsyscall_linux.go
    │       │   │   ├── zsyscall_linux_loong64.go
    │       │   │   ├── zsyscall_linux_mips64.go
    │       │   │   ├── zsyscall_linux_mips64le.go
    │       │   │   ├── zsyscall_linux_mips.go
    │       │   │   ├── zsyscall_linux_mipsle.go
    │       │   │   ├── zsyscall_linux_ppc64.go
    │       │   │   ├── zsyscall_linux_ppc64le.go
    │       │   │   ├── zsyscall_linux_ppc.go
    │       │   │   ├── zsyscall_linux_riscv64.go
    │       │   │   ├── zsyscall_linux_s390x.go
    │       │   │   ├── zsyscall_linux_sparc64.go
    │       │   │   ├── zsyscall_netbsd_386.go
    │       │   │   ├── zsyscall_netbsd_amd64.go
    │       │   │   ├── zsyscall_netbsd_arm64.go
    │       │   │   ├── zsyscall_netbsd_arm.go
    │       │   │   ├── zsyscall_openbsd_386.go
    │       │   │   ├── zsyscall_openbsd_386.s
    │       │   │   ├── zsyscall_openbsd_amd64.go
    │       │   │   ├── zsyscall_openbsd_amd64.s
    │       │   │   ├── zsyscall_openbsd_arm64.go
    │       │   │   ├── zsyscall_openbsd_arm64.s
    │       │   │   ├── zsyscall_openbsd_arm.go
    │       │   │   ├── zsyscall_openbsd_arm.s
    │       │   │   ├── zsyscall_openbsd_mips64.go
    │       │   │   ├── zsyscall_openbsd_mips64.s
    │       │   │   ├── zsyscall_openbsd_ppc64.go
    │       │   │   ├── zsyscall_openbsd_ppc64.s
    │       │   │   ├── zsyscall_openbsd_riscv64.go
    │       │   │   ├── zsyscall_openbsd_riscv64.s
    │       │   │   ├── zsyscall_solaris_amd64.go
    │       │   │   ├── zsyscall_zos_s390x.go
    │       │   │   ├── zsysctl_openbsd_386.go
    │       │   │   ├── zsysctl_openbsd_amd64.go
    │       │   │   ├── zsysctl_openbsd_arm64.go
    │       │   │   ├── zsysctl_openbsd_arm.go
    │       │   │   ├── zsysctl_openbsd_mips64.go
    │       │   │   ├── zsysctl_openbsd_ppc64.go
    │       │   │   ├── zsysctl_openbsd_riscv64.go
    │       │   │   ├── zsysnum_darwin_amd64.go
    │       │   │   ├── zsysnum_darwin_arm64.go
    │       │   │   ├── zsysnum_dragonfly_amd64.go
    │       │   │   ├── zsysnum_freebsd_386.go
    │       │   │   ├── zsysnum_freebsd_amd64.go
    │       │   │   ├── zsysnum_freebsd_arm64.go
    │       │   │   ├── zsysnum_freebsd_arm.go
    │       │   │   ├── zsysnum_freebsd_riscv64.go
    │       │   │   ├── zsysnum_linux_386.go
    │       │   │   ├── zsysnum_linux_amd64.go
    │       │   │   ├── zsysnum_linux_arm64.go
    │       │   │   ├── zsysnum_linux_arm.go
    │       │   │   ├── zsysnum_linux_loong64.go
    │       │   │   ├── zsysnum_linux_mips64.go
    │       │   │   ├── zsysnum_linux_mips64le.go
    │       │   │   ├── zsysnum_linux_mips.go
    │       │   │   ├── zsysnum_linux_mipsle.go
    │       │   │   ├── zsysnum_linux_ppc64.go
    │       │   │   ├── zsysnum_linux_ppc64le.go
    │       │   │   ├── zsysnum_linux_ppc.go
    │       │   │   ├── zsysnum_linux_riscv64.go
    │       │   │   ├── zsysnum_linux_s390x.go
    │       │   │   ├── zsysnum_linux_sparc64.go
    │       │   │   ├── zsysnum_netbsd_386.go
    │       │   │   ├── zsysnum_netbsd_amd64.go
    │       │   │   ├── zsysnum_netbsd_arm64.go
    │       │   │   ├── zsysnum_netbsd_arm.go
    │       │   │   ├── zsysnum_openbsd_386.go
    │       │   │   ├── zsysnum_openbsd_amd64.go
    │       │   │   ├── zsysnum_openbsd_arm64.go
    │       │   │   ├── zsysnum_openbsd_arm.go
    │       │   │   ├── zsysnum_openbsd_mips64.go
    │       │   │   ├── zsysnum_openbsd_ppc64.go
    │       │   │   ├── zsysnum_openbsd_riscv64.go
    │       │   │   ├── zsysnum_zos_s390x.go
    │       │   │   ├── ztypes_aix_ppc64.go
    │       │   │   ├── ztypes_aix_ppc.go
    │       │   │   ├── ztypes_darwin_amd64.go
    │       │   │   ├── ztypes_darwin_arm64.go
    │       │   │   ├── ztypes_dragonfly_amd64.go
    │       │   │   ├── ztypes_freebsd_386.go
    │       │   │   ├── ztypes_freebsd_amd64.go
    │       │   │   ├── ztypes_freebsd_arm64.go
    │       │   │   ├── ztypes_freebsd_arm.go
    │       │   │   ├── ztypes_freebsd_riscv64.go
    │       │   │   ├── ztypes_linux_386.go
    │       │   │   ├── ztypes_linux_amd64.go
    │       │   │   ├── ztypes_linux_arm64.go
    │       │   │   ├── ztypes_linux_arm.go
    │       │   │   ├── ztypes_linux.go
    │       │   │   ├── ztypes_linux_loong64.go
    │       │   │   ├── ztypes_linux_mips64.go
    │       │   │   ├── ztypes_linux_mips64le.go
    │       │   │   ├── ztypes_linux_mips.go
    │       │   │   ├── ztypes_linux_mipsle.go
    │       │   │   ├── ztypes_linux_ppc64.go
    │       │   │   ├── ztypes_linux_ppc64le.go
    │       │   │   ├── ztypes_linux_ppc.go
    │       │   │   ├── ztypes_linux_riscv64.go
    │       │   │   ├── ztypes_linux_s390x.go
    │       │   │   ├── ztypes_linux_sparc64.go
    │       │   │   ├── ztypes_netbsd_386.go
    │       │   │   ├── ztypes_netbsd_amd64.go
    │       │   │   ├── ztypes_netbsd_arm64.go
    │       │   │   ├── ztypes_netbsd_arm.go
    │       │   │   ├── ztypes_openbsd_386.go
    │       │   │   ├── ztypes_openbsd_amd64.go
    │       │   │   ├── ztypes_openbsd_arm64.go
    │       │   │   ├── ztypes_openbsd_arm.go
    │       │   │   ├── ztypes_openbsd_mips64.go
    │       │   │   ├── ztypes_openbsd_ppc64.go
    │       │   │   ├── ztypes_openbsd_riscv64.go
    │       │   │   ├── ztypes_solaris_amd64.go
    │       │   │   └── ztypes_zos_s390x.go
    │       │   └── windows
    │       │       ├── aliases.go
    │       │       ├── dll_windows.go
    │       │       ├── env_windows.go
    │       │       ├── eventlog.go
    │       │       ├── exec_windows.go
    │       │       ├── memory_windows.go
    │       │       ├── mkerrors.bash
    │       │       ├── mkknownfolderids.bash
    │       │       ├── mksyscall.go
    │       │       ├── race0.go
    │       │       ├── race.go
    │       │       ├── registry
    │       │       │   ├── key.go
    │       │       │   ├── mksyscall.go
    │       │       │   ├── syscall.go
    │       │       │   ├── value.go
    │       │       │   └── zsyscall_windows.go
    │       │       ├── security_windows.go
    │       │       ├── service.go
    │       │       ├── setupapi_windows.go
    │       │       ├── str.go
    │       │       ├── syscall.go
    │       │       ├── syscall_windows.go
    │       │       ├── types_windows_386.go
    │       │       ├── types_windows_amd64.go
    │       │       ├── types_windows_arm64.go
    │       │       ├── types_windows_arm.go
    │       │       ├── types_windows.go
    │       │       ├── zerrors_windows.go
    │       │       ├── zknownfolderids_windows.go
    │       │       └── zsyscall_windows.go
    │       ├── text
    │       │   ├── internal
    │       │   │   ├── language
    │       │   │   │   ├── common.go
    │       │   │   │   ├── compact
    │       │   │   │   │   ├── compact.go
    │       │   │   │   │   ├── language.go
    │       │   │   │   │   ├── parents.go
    │       │   │   │   │   ├── tables.go
    │       │   │   │   │   └── tags.go
    │       │   │   │   ├── compact.go
    │       │   │   │   ├── compose.go
    │       │   │   │   ├── coverage.go
    │       │   │   │   ├── language.go
    │       │   │   │   ├── lookup.go
    │       │   │   │   ├── match.go
    │       │   │   │   ├── parse.go
    │       │   │   │   ├── tables.go
    │       │   │   │   └── tags.go
    │       │   │   └── tag
    │       │   │       └── tag.go
    │       │   ├── language
    │       │   │   ├── coverage.go
    │       │   │   ├── doc.go
    │       │   │   ├── language.go
    │       │   │   ├── match.go
    │       │   │   ├── parse.go
    │       │   │   ├── tables.go
    │       │   │   └── tags.go
    │       │   ├── LICENSE
    │       │   ├── PATENTS
    │       │   ├── secure
    │       │   │   └── bidirule
    │       │   │       ├── bidirule10.0.0.go
    │       │   │       ├── bidirule9.0.0.go
    │       │   │       └── bidirule.go
    │       │   ├── transform
    │       │   │   └── transform.go
    │       │   └── unicode
    │       │       ├── bidi
    │       │       │   ├── bidi.go
    │       │       │   ├── bracket.go
    │       │       │   ├── core.go
    │       │       │   ├── prop.go
    │       │       │   ├── tables10.0.0.go
    │       │       │   ├── tables11.0.0.go
    │       │       │   ├── tables12.0.0.go
    │       │       │   ├── tables13.0.0.go
    │       │       │   ├── tables15.0.0.go
    │       │       │   ├── tables9.0.0.go
    │       │       │   └── trieval.go
    │       │       └── norm
    │       │           ├── composition.go
    │       │           ├── forminfo.go
    │       │           ├── input.go
    │       │           ├── iter.go
    │       │           ├── normalize.go
    │       │           ├── readwriter.go
    │       │           ├── tables10.0.0.go
    │       │           ├── tables11.0.0.go
    │       │           ├── tables12.0.0.go
    │       │           ├── tables13.0.0.go
    │       │           ├── tables15.0.0.go
    │       │           ├── tables9.0.0.go
    │       │           ├── transform.go
    │       │           └── trie.go
    │       └── time
    │           ├── LICENSE
    │           ├── PATENTS
    │           └── rate
    │               ├── rate.go
    │               └── sometimes.go
    ├── google.golang.org
    │   ├── api
    │   │   ├── AUTHORS
    │   │   ├── CONTRIBUTORS
    │   │   ├── googleapi
    │   │   │   ├── googleapi.go
    │   │   │   ├── transport
    │   │   │   │   └── apikey.go
    │   │   │   └── types.go
    │   │   ├── internal
    │   │   │   ├── cba.go
    │   │   │   ├── cert
    │   │   │   │   ├── default_cert.go
    │   │   │   │   ├── enterprise_cert.go
    │   │   │   │   └── secureconnect_cert.go
    │   │   │   ├── conn_pool.go
    │   │   │   ├── creds.go
    │   │   │   ├── impersonate
    │   │   │   │   └── impersonate.go
    │   │   │   ├── s2a.go
    │   │   │   ├── settings.go
    │   │   │   ├── third_party
    │   │   │   │   └── uritemplates
    │   │   │   │       ├── LICENSE
    │   │   │   │       ├── METADATA
    │   │   │   │       ├── uritemplates.go
    │   │   │   │       └── utils.go
    │   │   │   └── version.go
    │   │   ├── iterator
    │   │   │   └── iterator.go
    │   │   ├── LICENSE
    │   │   ├── option
    │   │   │   ├── internaloption
    │   │   │   │   └── internaloption.go
    │   │   │   └── option.go
    │   │   └── transport
    │   │       ├── grpc
    │   │       │   ├── dial.go
    │   │       │   ├── dial_socketopt.go
    │   │       │   └── pool.go
    │   │       └── http
    │   │           └── dial.go
    │   ├── genproto
    │   │   └── googleapis
    │   │       ├── api
    │   │       │   ├── annotations
    │   │       │   │   ├── annotations.pb.go
    │   │       │   │   ├── client.pb.go
    │   │       │   │   ├── field_behavior.pb.go
    │   │       │   │   ├── field_info.pb.go
    │   │       │   │   ├── http.pb.go
    │   │       │   │   ├── resource.pb.go
    │   │       │   │   └── routing.pb.go
    │   │       │   ├── launch_stage.pb.go
    │   │       │   └── LICENSE
    │   │       └── rpc
    │   │           ├── code
    │   │           │   └── code.pb.go
    │   │           ├── errdetails
    │   │           │   └── error_details.pb.go
    │   │           ├── LICENSE
    │   │           └── status
    │   │               └── status.pb.go
    │   ├── grpc
    │   │   ├── attributes
    │   │   │   └── attributes.go
    │   │   ├── AUTHORS
    │   │   ├── backoff
    │   │   │   └── backoff.go
    │   │   ├── backoff.go
    │   │   ├── balancer
    │   │   │   ├── balancer.go
    │   │   │   ├── base
    │   │   │   │   ├── balancer.go
    │   │   │   │   └── base.go
    │   │   │   ├── conn_state_evaluator.go
    │   │   │   ├── grpclb
    │   │   │   │   ├── grpclb_config.go
    │   │   │   │   ├── grpclb.go
    │   │   │   │   ├── grpclb_picker.go
    │   │   │   │   ├── grpclb_remote_balancer.go
    │   │   │   │   ├── grpclb_util.go
    │   │   │   │   ├── grpc_lb_v1
    │   │   │   │   │   ├── load_balancer_grpc.pb.go
    │   │   │   │   │   └── load_balancer.pb.go
    │   │   │   │   └── state
    │   │   │   │       └── state.go
    │   │   │   ├── pickfirst
    │   │   │   │   ├── internal
    │   │   │   │   │   └── internal.go
    │   │   │   │   ├── pickfirst.go
    │   │   │   │   └── pickfirstleaf
    │   │   │   │       └── pickfirstleaf.go
    │   │   │   ├── roundrobin
    │   │   │   │   └── roundrobin.go
    │   │   │   └── subconn.go
    │   │   ├── balancer_wrapper.go
    │   │   ├── binarylog
    │   │   │   └── grpc_binarylog_v1
    │   │   │       └── binarylog.pb.go
    │   │   ├── call.go
    │   │   ├── channelz
    │   │   │   └── channelz.go
    │   │   ├── clientconn.go
    │   │   ├── codec.go
    │   │   ├── CODE-OF-CONDUCT.md
    │   │   ├── codes
    │   │   │   ├── codes.go
    │   │   │   └── code_string.go
    │   │   ├── connectivity
    │   │   │   └── connectivity.go
    │   │   ├── CONTRIBUTING.md
    │   │   ├── credentials
    │   │   │   ├── alts
    │   │   │   │   ├── alts.go
    │   │   │   │   ├── internal
    │   │   │   │   │   ├── authinfo
    │   │   │   │   │   │   └── authinfo.go
    │   │   │   │   │   ├── common.go
    │   │   │   │   │   ├── conn
    │   │   │   │   │   │   ├── aeadrekey.go
    │   │   │   │   │   │   ├── aes128gcm.go
    │   │   │   │   │   │   ├── aes128gcmrekey.go
    │   │   │   │   │   │   ├── common.go
    │   │   │   │   │   │   ├── counter.go
    │   │   │   │   │   │   ├── record.go
    │   │   │   │   │   │   └── utils.go
    │   │   │   │   │   ├── handshaker
    │   │   │   │   │   │   ├── handshaker.go
    │   │   │   │   │   │   └── service
    │   │   │   │   │   │       └── service.go
    │   │   │   │   │   └── proto
    │   │   │   │   │       └── grpc_gcp
    │   │   │   │   │           ├── altscontext.pb.go
    │   │   │   │   │           ├── handshaker_grpc.pb.go
    │   │   │   │   │           ├── handshaker.pb.go
    │   │   │   │   │           └── transport_security_common.pb.go
    │   │   │   │   └── utils.go
    │   │   │   ├── credentials.go
    │   │   │   ├── google
    │   │   │   │   ├── google.go
    │   │   │   │   └── xds.go
    │   │   │   ├── insecure
    │   │   │   │   └── insecure.go
    │   │   │   ├── oauth
    │   │   │   │   └── oauth.go
    │   │   │   └── tls.go
    │   │   ├── dialoptions.go
    │   │   ├── doc.go
    │   │   ├── encoding
    │   │   │   ├── encoding.go
    │   │   │   ├── encoding_v2.go
    │   │   │   └── proto
    │   │   │       └── proto.go
    │   │   ├── experimental
    │   │   │   └── stats
    │   │   │       ├── metricregistry.go
    │   │   │       └── metrics.go
    │   │   ├── GOVERNANCE.md
    │   │   ├── grpclog
    │   │   │   ├── component.go
    │   │   │   ├── grpclog.go
    │   │   │   ├── internal
    │   │   │   │   ├── grpclog.go
    │   │   │   │   ├── logger.go
    │   │   │   │   └── loggerv2.go
    │   │   │   ├── logger.go
    │   │   │   └── loggerv2.go
    │   │   ├── interceptor.go
    │   │   ├── internal
    │   │   │   ├── backoff
    │   │   │   │   └── backoff.go
    │   │   │   ├── balancer
    │   │   │   │   └── gracefulswitch
    │   │   │   │       ├── config.go
    │   │   │   │       └── gracefulswitch.go
    │   │   │   ├── balancerload
    │   │   │   │   └── load.go
    │   │   │   ├── binarylog
    │   │   │   │   ├── binarylog.go
    │   │   │   │   ├── binarylog_testutil.go
    │   │   │   │   ├── env_config.go
    │   │   │   │   ├── method_logger.go
    │   │   │   │   └── sink.go
    │   │   │   ├── buffer
    │   │   │   │   └── unbounded.go
    │   │   │   ├── channelz
    │   │   │   │   ├── channel.go
    │   │   │   │   ├── channelmap.go
    │   │   │   │   ├── funcs.go
    │   │   │   │   ├── logging.go
    │   │   │   │   ├── server.go
    │   │   │   │   ├── socket.go
    │   │   │   │   ├── subchannel.go
    │   │   │   │   ├── syscall_linux.go
    │   │   │   │   ├── syscall_nonlinux.go
    │   │   │   │   └── trace.go
    │   │   │   ├── credentials
    │   │   │   │   ├── credentials.go
    │   │   │   │   ├── spiffe.go
    │   │   │   │   ├── syscallconn.go
    │   │   │   │   └── util.go
    │   │   │   ├── envconfig
    │   │   │   │   ├── envconfig.go
    │   │   │   │   ├── observability.go
    │   │   │   │   └── xds.go
    │   │   │   ├── experimental.go
    │   │   │   ├── googlecloud
    │   │   │   │   ├── googlecloud.go
    │   │   │   │   ├── manufacturer.go
    │   │   │   │   ├── manufacturer_linux.go
    │   │   │   │   └── manufacturer_windows.go
    │   │   │   ├── grpclog
    │   │   │   │   └── prefix_logger.go
    │   │   │   ├── grpcsync
    │   │   │   │   ├── callback_serializer.go
    │   │   │   │   ├── event.go
    │   │   │   │   ├── oncefunc.go
    │   │   │   │   └── pubsub.go
    │   │   │   ├── grpcutil
    │   │   │   │   ├── compressor.go
    │   │   │   │   ├── encode_duration.go
    │   │   │   │   ├── grpcutil.go
    │   │   │   │   ├── metadata.go
    │   │   │   │   ├── method.go
    │   │   │   │   └── regex.go
    │   │   │   ├── idle
    │   │   │   │   └── idle.go
    │   │   │   ├── internal.go
    │   │   │   ├── metadata
    │   │   │   │   └── metadata.go
    │   │   │   ├── pretty
    │   │   │   │   └── pretty.go
    │   │   │   ├── resolver
    │   │   │   │   ├── config_selector.go
    │   │   │   │   ├── dns
    │   │   │   │   │   ├── dns_resolver.go
    │   │   │   │   │   └── internal
    │   │   │   │   │       └── internal.go
    │   │   │   │   ├── passthrough
    │   │   │   │   │   └── passthrough.go
    │   │   │   │   └── unix
    │   │   │   │       └── unix.go
    │   │   │   ├── serviceconfig
    │   │   │   │   ├── duration.go
    │   │   │   │   └── serviceconfig.go
    │   │   │   ├── stats
    │   │   │   │   ├── labels.go
    │   │   │   │   └── metrics_recorder_list.go
    │   │   │   ├── status
    │   │   │   │   └── status.go
    │   │   │   ├── syscall
    │   │   │   │   ├── syscall_linux.go
    │   │   │   │   └── syscall_nonlinux.go
    │   │   │   ├── tcp_keepalive_others.go
    │   │   │   ├── tcp_keepalive_unix.go
    │   │   │   ├── tcp_keepalive_windows.go
    │   │   │   ├── transport
    │   │   │   │   ├── bdp_estimator.go
    │   │   │   │   ├── client_stream.go
    │   │   │   │   ├── controlbuf.go
    │   │   │   │   ├── defaults.go
    │   │   │   │   ├── flowcontrol.go
    │   │   │   │   ├── handler_server.go
    │   │   │   │   ├── http2_client.go
    │   │   │   │   ├── http2_server.go
    │   │   │   │   ├── http_util.go
    │   │   │   │   ├── logging.go
    │   │   │   │   ├── networktype
    │   │   │   │   │   └── networktype.go
    │   │   │   │   ├── proxy.go
    │   │   │   │   ├── server_stream.go
    │   │   │   │   └── transport.go
    │   │   │   └── xds
    │   │   │       └── xds.go
    │   │   ├── keepalive
    │   │   │   └── keepalive.go
    │   │   ├── LICENSE
    │   │   ├── MAINTAINERS.md
    │   │   ├── Makefile
    │   │   ├── mem
    │   │   │   ├── buffer_pool.go
    │   │   │   ├── buffers.go
    │   │   │   └── buffer_slice.go
    │   │   ├── metadata
    │   │   │   └── metadata.go
    │   │   ├── NOTICE.txt
    │   │   ├── peer
    │   │   │   └── peer.go
    │   │   ├── picker_wrapper.go
    │   │   ├── preloader.go
    │   │   ├── README.md
    │   │   ├── resolver
    │   │   │   ├── dns
    │   │   │   │   └── dns_resolver.go
    │   │   │   ├── manual
    │   │   │   │   └── manual.go
    │   │   │   ├── map.go
    │   │   │   └── resolver.go
    │   │   ├── resolver_wrapper.go
    │   │   ├── rpc_util.go
    │   │   ├── SECURITY.md
    │   │   ├── server.go
    │   │   ├── serviceconfig
    │   │   │   └── serviceconfig.go
    │   │   ├── service_config.go
    │   │   ├── stats
    │   │   │   ├── handlers.go
    │   │   │   ├── metrics.go
    │   │   │   └── stats.go
    │   │   ├── status
    │   │   │   └── status.go
    │   │   ├── stream.go
    │   │   ├── stream_interfaces.go
    │   │   ├── tap
    │   │   │   └── tap.go
    │   │   ├── trace.go
    │   │   ├── trace_notrace.go
    │   │   ├── trace_withtrace.go
    │   │   └── version.go
    │   └── protobuf
    │       ├── encoding
    │       │   ├── protojson
    │       │   │   ├── decode.go
    │       │   │   ├── doc.go
    │       │   │   ├── encode.go
    │       │   │   └── well_known_types.go
    │       │   ├── prototext
    │       │   │   ├── decode.go
    │       │   │   ├── doc.go
    │       │   │   └── encode.go
    │       │   └── protowire
    │       │       └── wire.go
    │       ├── internal
    │       │   ├── descfmt
    │       │   │   └── stringer.go
    │       │   ├── descopts
    │       │   │   └── options.go
    │       │   ├── detrand
    │       │   │   └── rand.go
    │       │   ├── editiondefaults
    │       │   │   ├── defaults.go
    │       │   │   └── editions_defaults.binpb
    │       │   ├── encoding
    │       │   │   ├── defval
    │       │   │   │   └── default.go
    │       │   │   ├── json
    │       │   │   │   ├── decode.go
    │       │   │   │   ├── decode_number.go
    │       │   │   │   ├── decode_string.go
    │       │   │   │   ├── decode_token.go
    │       │   │   │   └── encode.go
    │       │   │   ├── messageset
    │       │   │   │   └── messageset.go
    │       │   │   ├── tag
    │       │   │   │   └── tag.go
    │       │   │   └── text
    │       │   │       ├── decode.go
    │       │   │       ├── decode_number.go
    │       │   │       ├── decode_string.go
    │       │   │       ├── decode_token.go
    │       │   │       ├── doc.go
    │       │   │       └── encode.go
    │       │   ├── errors
    │       │   │   └── errors.go
    │       │   ├── filedesc
    │       │   │   ├── build.go
    │       │   │   ├── desc.go
    │       │   │   ├── desc_init.go
    │       │   │   ├── desc_lazy.go
    │       │   │   ├── desc_list_gen.go
    │       │   │   ├── desc_list.go
    │       │   │   ├── editions.go
    │       │   │   └── placeholder.go
    │       │   ├── filetype
    │       │   │   └── build.go
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
    │       │   ├── impl
    │       │   │   ├── api_export.go
    │       │   │   ├── api_export_opaque.go
    │       │   │   ├── bitmap.go
    │       │   │   ├── bitmap_race.go
    │       │   │   ├── checkinit.go
    │       │   │   ├── codec_extension.go
    │       │   │   ├── codec_field.go
    │       │   │   ├── codec_field_opaque.go
    │       │   │   ├── codec_gen.go
    │       │   │   ├── codec_map.go
    │       │   │   ├── codec_message.go
    │       │   │   ├── codec_message_opaque.go
    │       │   │   ├── codec_messageset.go
    │       │   │   ├── codec_tables.go
    │       │   │   ├── codec_unsafe.go
    │       │   │   ├── convert.go
    │       │   │   ├── convert_list.go
    │       │   │   ├── convert_map.go
    │       │   │   ├── decode.go
    │       │   │   ├── encode.go
    │       │   │   ├── enum.go
    │       │   │   ├── equal.go
    │       │   │   ├── extension.go
    │       │   │   ├── lazy.go
    │       │   │   ├── legacy_enum.go
    │       │   │   ├── legacy_export.go
    │       │   │   ├── legacy_extension.go
    │       │   │   ├── legacy_file.go
    │       │   │   ├── legacy_message.go
    │       │   │   ├── merge_gen.go
    │       │   │   ├── merge.go
    │       │   │   ├── message.go
    │       │   │   ├── message_opaque_gen.go
    │       │   │   ├── message_opaque.go
    │       │   │   ├── message_reflect_field_gen.go
    │       │   │   ├── message_reflect_field.go
    │       │   │   ├── message_reflect_gen.go
    │       │   │   ├── message_reflect.go
    │       │   │   ├── pointer_unsafe.go
    │       │   │   ├── pointer_unsafe_opaque.go
    │       │   │   ├── presence.go
    │       │   │   └── validate.go
    │       │   ├── order
    │       │   │   ├── order.go
    │       │   │   └── range.go
    │       │   ├── pragma
    │       │   │   └── pragma.go
    │       │   ├── protolazy
    │       │   │   ├── bufferreader.go
    │       │   │   ├── lazy.go
    │       │   │   └── pointer_unsafe.go
    │       │   ├── set
    │       │   │   └── ints.go
    │       │   ├── strs
    │       │   │   ├── strings.go
    │       │   │   ├── strings_unsafe_go120.go
    │       │   │   └── strings_unsafe_go121.go
    │       │   └── version
    │       │       └── version.go
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
    │       ├── protoadapt
    │       │   └── convert.go
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
    │       ├── runtime
    │       │   ├── protoiface
    │       │   │   ├── legacy.go
    │       │   │   └── methods.go
    │       │   └── protoimpl
    │       │       ├── impl.go
    │       │       └── version.go
    │       └── types
    │           ├── descriptorpb
    │           │   └── descriptor.pb.go
    │           └── known
    │               ├── anypb
    │               │   └── any.pb.go
    │               ├── durationpb
    │               │   └── duration.pb.go
    │               ├── emptypb
    │               │   └── empty.pb.go
    │               ├── fieldmaskpb
    │               │   └── field_mask.pb.go
    │               ├── structpb
    │               │   └── struct.pb.go
    │               └── timestamppb
    │                   └── timestamp.pb.go
    ├── go.opentelemetry.io
    │   ├── auto
    │   │   └── sdk
    │   │       ├── CONTRIBUTING.md
    │   │       ├── doc.go
    │   │       ├── internal
    │   │       │   └── telemetry
    │   │       │       ├── attr.go
    │   │       │       ├── doc.go
    │   │       │       ├── id.go
    │   │       │       ├── number.go
    │   │       │       ├── resource.go
    │   │       │       ├── scope.go
    │   │       │       ├── span.go
    │   │       │       ├── status.go
    │   │       │       ├── traces.go
    │   │       │       └── value.go
    │   │       ├── LICENSE
    │   │       ├── limit.go
    │   │       ├── span.go
    │   │       ├── tracer.go
    │   │       ├── tracer_provider.go
    │   │       └── VERSIONING.md
    │   ├── contrib
    │   │   └── instrumentation
    │   │       ├── google.golang.org
    │   │       │   └── grpc
    │   │       │       └── otelgrpc
    │   │       │           ├── config.go
    │   │       │           ├── doc.go
    │   │       │           ├── interceptor.go
    │   │       │           ├── interceptorinfo.go
    │   │       │           ├── internal
    │   │       │           │   └── parse.go
    │   │       │           ├── LICENSE
    │   │       │           ├── metadata_supplier.go
    │   │       │           ├── semconv.go
    │   │       │           ├── stats_handler.go
    │   │       │           └── version.go
    │   │       └── net
    │   │           └── http
    │   │               └── otelhttp
    │   │                   ├── client.go
    │   │                   ├── common.go
    │   │                   ├── config.go
    │   │                   ├── doc.go
    │   │                   ├── handler.go
    │   │                   ├── internal
    │   │                   │   ├── request
    │   │                   │   │   ├── body_wrapper.go
    │   │                   │   │   └── resp_writer_wrapper.go
    │   │                   │   ├── semconv
    │   │                   │   │   ├── env.go
    │   │                   │   │   ├── httpconv.go
    │   │                   │   │   ├── util.go
    │   │                   │   │   └── v1.20.0.go
    │   │                   │   └── semconvutil
    │   │                   │       ├── gen.go
    │   │                   │       ├── httpconv.go
    │   │                   │       └── netconv.go
    │   │                   ├── labeler.go
    │   │                   ├── LICENSE
    │   │                   ├── start_time_context.go
    │   │                   ├── transport.go
    │   │                   └── version.go
    │   └── otel
    │       ├── attribute
    │       │   ├── doc.go
    │       │   ├── encoder.go
    │       │   ├── filter.go
    │       │   ├── iterator.go
    │       │   ├── key.go
    │       │   ├── kv.go
    │       │   ├── README.md
    │       │   ├── set.go
    │       │   ├── type_string.go
    │       │   └── value.go
    │       ├── baggage
    │       │   ├── baggage.go
    │       │   ├── context.go
    │       │   ├── doc.go
    │       │   └── README.md
    │       ├── CHANGELOG.md
    │       ├── CODEOWNERS
    │       ├── codes
    │       │   ├── codes.go
    │       │   ├── doc.go
    │       │   └── README.md
    │       ├── CONTRIBUTING.md
    │       ├── doc.go
    │       ├── error_handler.go
    │       ├── get_main_pkgs.sh
    │       ├── handler.go
    │       ├── internal
    │       │   ├── attribute
    │       │   │   └── attribute.go
    │       │   ├── baggage
    │       │   │   ├── baggage.go
    │       │   │   └── context.go
    │       │   ├── gen.go
    │       │   ├── global
    │       │   │   ├── handler.go
    │       │   │   ├── instruments.go
    │       │   │   ├── internal_logging.go
    │       │   │   ├── meter.go
    │       │   │   ├── propagator.go
    │       │   │   ├── state.go
    │       │   │   └── trace.go
    │       │   └── rawhelpers.go
    │       ├── internal_logging.go
    │       ├── LICENSE
    │       ├── Makefile
    │       ├── metric
    │       │   ├── asyncfloat64.go
    │       │   ├── asyncint64.go
    │       │   ├── config.go
    │       │   ├── doc.go
    │       │   ├── embedded
    │       │   │   ├── embedded.go
    │       │   │   └── README.md
    │       │   ├── instrument.go
    │       │   ├── LICENSE
    │       │   ├── meter.go
    │       │   ├── noop
    │       │   │   ├── noop.go
    │       │   │   └── README.md
    │       │   ├── README.md
    │       │   ├── syncfloat64.go
    │       │   └── syncint64.go
    │       ├── metric.go
    │       ├── propagation
    │       │   ├── baggage.go
    │       │   ├── doc.go
    │       │   ├── propagation.go
    │       │   ├── README.md
    │       │   └── trace_context.go
    │       ├── propagation.go
    │       ├── README.md
    │       ├── RELEASING.md
    │       ├── renovate.json
    │       ├── requirements.txt
    │       ├── semconv
    │       │   ├── v1.17.0
    │       │   │   ├── doc.go
    │       │   │   ├── event.go
    │       │   │   ├── exception.go
    │       │   │   ├── http.go
    │       │   │   ├── README.md
    │       │   │   ├── resource.go
    │       │   │   ├── schema.go
    │       │   │   └── trace.go
    │       │   ├── v1.20.0
    │       │   │   ├── attribute_group.go
    │       │   │   ├── doc.go
    │       │   │   ├── event.go
    │       │   │   ├── exception.go
    │       │   │   ├── http.go
    │       │   │   ├── README.md
    │       │   │   ├── resource.go
    │       │   │   ├── schema.go
    │       │   │   └── trace.go
    │       │   └── v1.26.0
    │       │       ├── attribute_group.go
    │       │       ├── doc.go
    │       │       ├── exception.go
    │       │       ├── metric.go
    │       │       ├── README.md
    │       │       └── schema.go
    │       ├── trace
    │       │   ├── config.go
    │       │   ├── context.go
    │       │   ├── doc.go
    │       │   ├── embedded
    │       │   │   ├── embedded.go
    │       │   │   └── README.md
    │       │   ├── LICENSE
    │       │   ├── nonrecording.go
    │       │   ├── noop
    │       │   │   ├── noop.go
    │       │   │   └── README.md
    │       │   ├── noop.go
    │       │   ├── provider.go
    │       │   ├── README.md
    │       │   ├── span.go
    │       │   ├── trace.go
    │       │   ├── tracer.go
    │       │   └── tracestate.go
    │       ├── trace.go
    │       ├── verify_readmes.sh
    │       ├── verify_released_changelog.sh
    │       ├── version.go
    │       ├── VERSIONING.md
    │       └── versions.yaml
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
    └── modules.txt

493 directories, 2612 files
