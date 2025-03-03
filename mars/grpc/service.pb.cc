// Generated by the protocol buffer compiler.  DO NOT EDIT!
// NO CHECKED-IN PROTOBUF GENCODE
// source: service.proto
// Protobuf C++ Version: 5.27.0

#include "service.pb.h"

#include <algorithm>
#include <type_traits>
#include "google/protobuf/io/coded_stream.h"
#include "google/protobuf/generated_message_tctable_impl.h"
#include "google/protobuf/extension_set.h"
#include "google/protobuf/wire_format_lite.h"
#include "google/protobuf/descriptor.h"
#include "google/protobuf/generated_message_reflection.h"
#include "google/protobuf/reflection_ops.h"
#include "google/protobuf/wire_format.h"
// @@protoc_insertion_point(includes)

// Must be included last.
#include "google/protobuf/port_def.inc"
PROTOBUF_PRAGMA_INIT_SEG
namespace _pb = ::google::protobuf;
namespace _pbi = ::google::protobuf::internal;
namespace _fl = ::google::protobuf::internal::field_layout;
namespace mars {

inline constexpr StatusResponse::Impl_::Impl_(
    ::_pbi::ConstantInitialized) noexcept
      : status_(
            &::google::protobuf::internal::fixed_address_empty_string,
            ::_pbi::ConstantInitialized()),
        _cached_size_{0} {}

template <typename>
PROTOBUF_CONSTEXPR StatusResponse::StatusResponse(::_pbi::ConstantInitialized)
    : _impl_(::_pbi::ConstantInitialized()) {}
struct StatusResponseDefaultTypeInternal {
  PROTOBUF_CONSTEXPR StatusResponseDefaultTypeInternal() : _instance(::_pbi::ConstantInitialized{}) {}
  ~StatusResponseDefaultTypeInternal() {}
  union {
    StatusResponse _instance;
  };
};

PROTOBUF_ATTRIBUTE_NO_DESTROY PROTOBUF_CONSTINIT
    PROTOBUF_ATTRIBUTE_INIT_PRIORITY1 StatusResponseDefaultTypeInternal _StatusResponse_default_instance_;
      template <typename>
PROTOBUF_CONSTEXPR StatusRequest::StatusRequest(::_pbi::ConstantInitialized) {}
struct StatusRequestDefaultTypeInternal {
  PROTOBUF_CONSTEXPR StatusRequestDefaultTypeInternal() : _instance(::_pbi::ConstantInitialized{}) {}
  ~StatusRequestDefaultTypeInternal() {}
  union {
    StatusRequest _instance;
  };
};

PROTOBUF_ATTRIBUTE_NO_DESTROY PROTOBUF_CONSTINIT
    PROTOBUF_ATTRIBUTE_INIT_PRIORITY1 StatusRequestDefaultTypeInternal _StatusRequest_default_instance_;
}  // namespace mars
static constexpr const ::_pb::EnumDescriptor**
    file_level_enum_descriptors_service_2eproto = nullptr;
static constexpr const ::_pb::ServiceDescriptor**
    file_level_service_descriptors_service_2eproto = nullptr;
const ::uint32_t
    TableStruct_service_2eproto::offsets[] ABSL_ATTRIBUTE_SECTION_VARIABLE(
        protodesc_cold) = {
        ~0u,  // no _has_bits_
        PROTOBUF_FIELD_OFFSET(::mars::StatusRequest, _internal_metadata_),
        ~0u,  // no _extensions_
        ~0u,  // no _oneof_case_
        ~0u,  // no _weak_field_map_
        ~0u,  // no _inlined_string_donated_
        ~0u,  // no _split_
        ~0u,  // no sizeof(Split)
        ~0u,  // no _has_bits_
        PROTOBUF_FIELD_OFFSET(::mars::StatusResponse, _internal_metadata_),
        ~0u,  // no _extensions_
        ~0u,  // no _oneof_case_
        ~0u,  // no _weak_field_map_
        ~0u,  // no _inlined_string_donated_
        ~0u,  // no _split_
        ~0u,  // no sizeof(Split)
        PROTOBUF_FIELD_OFFSET(::mars::StatusResponse, _impl_.status_),
};

static const ::_pbi::MigrationSchema
    schemas[] ABSL_ATTRIBUTE_SECTION_VARIABLE(protodesc_cold) = {
        {0, -1, -1, sizeof(::mars::StatusRequest)},
        {8, -1, -1, sizeof(::mars::StatusResponse)},
};
static const ::_pb::Message* const file_default_instances[] = {
    &::mars::_StatusRequest_default_instance_._instance,
    &::mars::_StatusResponse_default_instance_._instance,
};
const char descriptor_table_protodef_service_2eproto[] ABSL_ATTRIBUTE_SECTION_VARIABLE(
    protodesc_cold) = {
    "\n\rservice.proto\022\004mars\"\017\n\rStatusRequest\" "
    "\n\016StatusResponse\022\016\n\006status\030\001 \001(\t2E\n\013Mars"
    "Service\0226\n\tGetStatus\022\023.mars.StatusReques"
    "t\032\024.mars.StatusResponseb\006proto3"
};
static ::absl::once_flag descriptor_table_service_2eproto_once;
PROTOBUF_CONSTINIT const ::_pbi::DescriptorTable descriptor_table_service_2eproto = {
    false,
    false,
    151,
    descriptor_table_protodef_service_2eproto,
    "service.proto",
    &descriptor_table_service_2eproto_once,
    nullptr,
    0,
    2,
    schemas,
    file_default_instances,
    TableStruct_service_2eproto::offsets,
    file_level_enum_descriptors_service_2eproto,
    file_level_service_descriptors_service_2eproto,
};
namespace mars {
// ===================================================================

class StatusRequest::_Internal {
 public:
};

StatusRequest::StatusRequest(::google::protobuf::Arena* arena)
    : ::google::protobuf::internal::ZeroFieldsBase(arena) {
  // @@protoc_insertion_point(arena_constructor:mars.StatusRequest)
}
StatusRequest::StatusRequest(
    ::google::protobuf::Arena* arena,
    const StatusRequest& from)
    : ::google::protobuf::internal::ZeroFieldsBase(arena) {
  StatusRequest* const _this = this;
  (void)_this;
  _internal_metadata_.MergeFrom<::google::protobuf::UnknownFieldSet>(
      from._internal_metadata_);

  // @@protoc_insertion_point(copy_constructor:mars.StatusRequest)
}

const ::google::protobuf::MessageLite::ClassData*
StatusRequest::GetClassData() const {
  PROTOBUF_CONSTINIT static const ::google::protobuf::MessageLite::
      ClassDataFull _data_ = {
          {
              &_table_.header,
              nullptr,  // OnDemandRegisterArenaDtor
              nullptr,  // IsInitialized
              PROTOBUF_FIELD_OFFSET(StatusRequest, _impl_._cached_size_),
              false,
          },
          &StatusRequest::MergeImpl,
          &StatusRequest::kDescriptorMethods,
          &descriptor_table_service_2eproto,
          nullptr,  // tracker
      };
  ::google::protobuf::internal::PrefetchToLocalCache(&_data_);
  ::google::protobuf::internal::PrefetchToLocalCache(_data_.tc_table);
  return _data_.base();
}
PROTOBUF_CONSTINIT PROTOBUF_ATTRIBUTE_INIT_PRIORITY1
const ::_pbi::TcParseTable<0, 0, 0, 0, 2> StatusRequest::_table_ = {
  {
    0,  // no _has_bits_
    0, // no _extensions_
    0, 0,  // max_field_number, fast_idx_mask
    offsetof(decltype(_table_), field_lookup_table),
    4294967295,  // skipmap
    offsetof(decltype(_table_), field_names),  // no field_entries
    0,  // num_field_entries
    0,  // num_aux_entries
    offsetof(decltype(_table_), field_names),  // no aux_entries
    &_StatusRequest_default_instance_._instance,
    nullptr,  // post_loop_handler
    ::_pbi::TcParser::GenericFallback,  // fallback
    #ifdef PROTOBUF_PREFETCH_PARSE_TABLE
    ::_pbi::TcParser::GetTable<::mars::StatusRequest>(),  // to_prefetch
    #endif  // PROTOBUF_PREFETCH_PARSE_TABLE
  }, {{
    {::_pbi::TcParser::MiniParse, {}},
  }}, {{
    65535, 65535
  }},
  // no field_entries, or aux_entries
  {{
  }},
};









::google::protobuf::Metadata StatusRequest::GetMetadata() const {
  return ::google::protobuf::internal::ZeroFieldsBase::GetMetadataImpl(GetClassData()->full());
}
// ===================================================================

class StatusResponse::_Internal {
 public:
};

StatusResponse::StatusResponse(::google::protobuf::Arena* arena)
    : ::google::protobuf::Message(arena) {
  SharedCtor(arena);
  // @@protoc_insertion_point(arena_constructor:mars.StatusResponse)
}
inline PROTOBUF_NDEBUG_INLINE StatusResponse::Impl_::Impl_(
    ::google::protobuf::internal::InternalVisibility visibility, ::google::protobuf::Arena* arena,
    const Impl_& from, const ::mars::StatusResponse& from_msg)
      : status_(arena, from.status_),
        _cached_size_{0} {}

StatusResponse::StatusResponse(
    ::google::protobuf::Arena* arena,
    const StatusResponse& from)
    : ::google::protobuf::Message(arena) {
  StatusResponse* const _this = this;
  (void)_this;
  _internal_metadata_.MergeFrom<::google::protobuf::UnknownFieldSet>(
      from._internal_metadata_);
  new (&_impl_) Impl_(internal_visibility(), arena, from._impl_, from);

  // @@protoc_insertion_point(copy_constructor:mars.StatusResponse)
}
inline PROTOBUF_NDEBUG_INLINE StatusResponse::Impl_::Impl_(
    ::google::protobuf::internal::InternalVisibility visibility,
    ::google::protobuf::Arena* arena)
      : status_(arena),
        _cached_size_{0} {}

inline void StatusResponse::SharedCtor(::_pb::Arena* arena) {
  new (&_impl_) Impl_(internal_visibility(), arena);
}
StatusResponse::~StatusResponse() {
  // @@protoc_insertion_point(destructor:mars.StatusResponse)
  _internal_metadata_.Delete<::google::protobuf::UnknownFieldSet>();
  SharedDtor();
}
inline void StatusResponse::SharedDtor() {
  ABSL_DCHECK(GetArena() == nullptr);
  _impl_.status_.Destroy();
  _impl_.~Impl_();
}

const ::google::protobuf::MessageLite::ClassData*
StatusResponse::GetClassData() const {
  PROTOBUF_CONSTINIT static const ::google::protobuf::MessageLite::
      ClassDataFull _data_ = {
          {
              &_table_.header,
              nullptr,  // OnDemandRegisterArenaDtor
              nullptr,  // IsInitialized
              PROTOBUF_FIELD_OFFSET(StatusResponse, _impl_._cached_size_),
              false,
          },
          &StatusResponse::MergeImpl,
          &StatusResponse::kDescriptorMethods,
          &descriptor_table_service_2eproto,
          nullptr,  // tracker
      };
  ::google::protobuf::internal::PrefetchToLocalCache(&_data_);
  ::google::protobuf::internal::PrefetchToLocalCache(_data_.tc_table);
  return _data_.base();
}
PROTOBUF_CONSTINIT PROTOBUF_ATTRIBUTE_INIT_PRIORITY1
const ::_pbi::TcParseTable<0, 1, 0, 34, 2> StatusResponse::_table_ = {
  {
    0,  // no _has_bits_
    0, // no _extensions_
    1, 0,  // max_field_number, fast_idx_mask
    offsetof(decltype(_table_), field_lookup_table),
    4294967294,  // skipmap
    offsetof(decltype(_table_), field_entries),
    1,  // num_field_entries
    0,  // num_aux_entries
    offsetof(decltype(_table_), field_names),  // no aux_entries
    &_StatusResponse_default_instance_._instance,
    nullptr,  // post_loop_handler
    ::_pbi::TcParser::GenericFallback,  // fallback
    #ifdef PROTOBUF_PREFETCH_PARSE_TABLE
    ::_pbi::TcParser::GetTable<::mars::StatusResponse>(),  // to_prefetch
    #endif  // PROTOBUF_PREFETCH_PARSE_TABLE
  }, {{
    // string status = 1;
    {::_pbi::TcParser::FastUS1,
     {10, 63, 0, PROTOBUF_FIELD_OFFSET(StatusResponse, _impl_.status_)}},
  }}, {{
    65535, 65535
  }}, {{
    // string status = 1;
    {PROTOBUF_FIELD_OFFSET(StatusResponse, _impl_.status_), 0, 0,
    (0 | ::_fl::kFcSingular | ::_fl::kUtf8String | ::_fl::kRepAString)},
  }},
  // no aux_entries
  {{
    "\23\6\0\0\0\0\0\0"
    "mars.StatusResponse"
    "status"
  }},
};

PROTOBUF_NOINLINE void StatusResponse::Clear() {
// @@protoc_insertion_point(message_clear_start:mars.StatusResponse)
  ::google::protobuf::internal::TSanWrite(&_impl_);
  ::uint32_t cached_has_bits = 0;
  // Prevent compiler warnings about cached_has_bits being unused
  (void) cached_has_bits;

  _impl_.status_.ClearToEmpty();
  _internal_metadata_.Clear<::google::protobuf::UnknownFieldSet>();
}

::uint8_t* StatusResponse::_InternalSerialize(
    ::uint8_t* target,
    ::google::protobuf::io::EpsCopyOutputStream* stream) const {
  // @@protoc_insertion_point(serialize_to_array_start:mars.StatusResponse)
  ::uint32_t cached_has_bits = 0;
  (void)cached_has_bits;

  // string status = 1;
  if (!this->_internal_status().empty()) {
    const std::string& _s = this->_internal_status();
    ::google::protobuf::internal::WireFormatLite::VerifyUtf8String(
        _s.data(), static_cast<int>(_s.length()), ::google::protobuf::internal::WireFormatLite::SERIALIZE, "mars.StatusResponse.status");
    target = stream->WriteStringMaybeAliased(1, _s, target);
  }

  if (PROTOBUF_PREDICT_FALSE(_internal_metadata_.have_unknown_fields())) {
    target =
        ::_pbi::WireFormat::InternalSerializeUnknownFieldsToArray(
            _internal_metadata_.unknown_fields<::google::protobuf::UnknownFieldSet>(::google::protobuf::UnknownFieldSet::default_instance), target, stream);
  }
  // @@protoc_insertion_point(serialize_to_array_end:mars.StatusResponse)
  return target;
}

::size_t StatusResponse::ByteSizeLong() const {
// @@protoc_insertion_point(message_byte_size_start:mars.StatusResponse)
  ::size_t total_size = 0;

  ::uint32_t cached_has_bits = 0;
  // Prevent compiler warnings about cached_has_bits being unused
  (void) cached_has_bits;

  // string status = 1;
  if (!this->_internal_status().empty()) {
    total_size += 1 + ::google::protobuf::internal::WireFormatLite::StringSize(
                                    this->_internal_status());
  }

  return MaybeComputeUnknownFieldsSize(total_size, &_impl_._cached_size_);
}


void StatusResponse::MergeImpl(::google::protobuf::MessageLite& to_msg, const ::google::protobuf::MessageLite& from_msg) {
  auto* const _this = static_cast<StatusResponse*>(&to_msg);
  auto& from = static_cast<const StatusResponse&>(from_msg);
  // @@protoc_insertion_point(class_specific_merge_from_start:mars.StatusResponse)
  ABSL_DCHECK_NE(&from, _this);
  ::uint32_t cached_has_bits = 0;
  (void) cached_has_bits;

  if (!from._internal_status().empty()) {
    _this->_internal_set_status(from._internal_status());
  }
  _this->_internal_metadata_.MergeFrom<::google::protobuf::UnknownFieldSet>(from._internal_metadata_);
}

void StatusResponse::CopyFrom(const StatusResponse& from) {
// @@protoc_insertion_point(class_specific_copy_from_start:mars.StatusResponse)
  if (&from == this) return;
  Clear();
  MergeFrom(from);
}


void StatusResponse::InternalSwap(StatusResponse* PROTOBUF_RESTRICT other) {
  using std::swap;
  auto* arena = GetArena();
  ABSL_DCHECK_EQ(arena, other->GetArena());
  _internal_metadata_.InternalSwap(&other->_internal_metadata_);
  ::_pbi::ArenaStringPtr::InternalSwap(&_impl_.status_, &other->_impl_.status_, arena);
}

::google::protobuf::Metadata StatusResponse::GetMetadata() const {
  return ::google::protobuf::Message::GetMetadataImpl(GetClassData()->full());
}
// @@protoc_insertion_point(namespace_scope)
}  // namespace mars
namespace google {
namespace protobuf {
}  // namespace protobuf
}  // namespace google
// @@protoc_insertion_point(global_scope)
PROTOBUF_ATTRIBUTE_INIT_PRIORITY2 static ::std::false_type
    _static_init2_ PROTOBUF_UNUSED =
        (::_pbi::AddDescriptors(&descriptor_table_service_2eproto),
         ::std::false_type{});
#include "google/protobuf/port_undef.inc"
