// Generated by the protocol buffer compiler.  DO NOT EDIT!
// NO CHECKED-IN PROTOBUF GENCODE
// source: service.proto
// Protobuf C++ Version: 5.27.0

#ifndef GOOGLE_PROTOBUF_INCLUDED_service_2eproto_2epb_2eh
#define GOOGLE_PROTOBUF_INCLUDED_service_2eproto_2epb_2eh

#include <limits>
#include <string>
#include <type_traits>
#include <utility>

#include "google/protobuf/runtime_version.h"
#if PROTOBUF_VERSION != 5027000
#error "Protobuf C++ gencode is built with an incompatible version of"
#error "Protobuf C++ headers/runtime. See"
#error "https://protobuf.dev/support/cross-version-runtime-guarantee/#cpp"
#endif
#include "google/protobuf/io/coded_stream.h"
#include "google/protobuf/arena.h"
#include "google/protobuf/arenastring.h"
#include "google/protobuf/generated_message_bases.h"
#include "google/protobuf/generated_message_tctable_decl.h"
#include "google/protobuf/generated_message_util.h"
#include "google/protobuf/metadata_lite.h"
#include "google/protobuf/generated_message_reflection.h"
#include "google/protobuf/message.h"
#include "google/protobuf/repeated_field.h"  // IWYU pragma: export
#include "google/protobuf/extension_set.h"  // IWYU pragma: export
#include "google/protobuf/unknown_field_set.h"
// @@protoc_insertion_point(includes)

// Must be included last.
#include "google/protobuf/port_def.inc"

#define PROTOBUF_INTERNAL_EXPORT_service_2eproto

namespace google {
namespace protobuf {
namespace internal {
class AnyMetadata;
}  // namespace internal
}  // namespace protobuf
}  // namespace google

// Internal implementation detail -- do not use these members.
struct TableStruct_service_2eproto {
  static const ::uint32_t offsets[];
};
extern const ::google::protobuf::internal::DescriptorTable
    descriptor_table_service_2eproto;
namespace mars {
class StatusRequest;
struct StatusRequestDefaultTypeInternal;
extern StatusRequestDefaultTypeInternal _StatusRequest_default_instance_;
class StatusResponse;
struct StatusResponseDefaultTypeInternal;
extern StatusResponseDefaultTypeInternal _StatusResponse_default_instance_;
}  // namespace mars
namespace google {
namespace protobuf {
}  // namespace protobuf
}  // namespace google

namespace mars {

// ===================================================================


// -------------------------------------------------------------------

class StatusResponse final : public ::google::protobuf::Message
/* @@protoc_insertion_point(class_definition:mars.StatusResponse) */ {
 public:
  inline StatusResponse() : StatusResponse(nullptr) {}
  ~StatusResponse() override;
  template <typename = void>
  explicit PROTOBUF_CONSTEXPR StatusResponse(
      ::google::protobuf::internal::ConstantInitialized);

  inline StatusResponse(const StatusResponse& from) : StatusResponse(nullptr, from) {}
  inline StatusResponse(StatusResponse&& from) noexcept
      : StatusResponse(nullptr, std::move(from)) {}
  inline StatusResponse& operator=(const StatusResponse& from) {
    CopyFrom(from);
    return *this;
  }
  inline StatusResponse& operator=(StatusResponse&& from) noexcept {
    if (this == &from) return *this;
    if (GetArena() == from.GetArena()
#ifdef PROTOBUF_FORCE_COPY_IN_MOVE
        && GetArena() != nullptr
#endif  // !PROTOBUF_FORCE_COPY_IN_MOVE
    ) {
      InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }

  inline const ::google::protobuf::UnknownFieldSet& unknown_fields() const
      ABSL_ATTRIBUTE_LIFETIME_BOUND {
    return _internal_metadata_.unknown_fields<::google::protobuf::UnknownFieldSet>(::google::protobuf::UnknownFieldSet::default_instance);
  }
  inline ::google::protobuf::UnknownFieldSet* mutable_unknown_fields()
      ABSL_ATTRIBUTE_LIFETIME_BOUND {
    return _internal_metadata_.mutable_unknown_fields<::google::protobuf::UnknownFieldSet>();
  }

  static const ::google::protobuf::Descriptor* descriptor() {
    return GetDescriptor();
  }
  static const ::google::protobuf::Descriptor* GetDescriptor() {
    return default_instance().GetMetadata().descriptor;
  }
  static const ::google::protobuf::Reflection* GetReflection() {
    return default_instance().GetMetadata().reflection;
  }
  static const StatusResponse& default_instance() {
    return *internal_default_instance();
  }
  static inline const StatusResponse* internal_default_instance() {
    return reinterpret_cast<const StatusResponse*>(
        &_StatusResponse_default_instance_);
  }
  static constexpr int kIndexInFileMessages = 1;
  friend void swap(StatusResponse& a, StatusResponse& b) { a.Swap(&b); }
  inline void Swap(StatusResponse* other) {
    if (other == this) return;
#ifdef PROTOBUF_FORCE_COPY_IN_SWAP
    if (GetArena() != nullptr && GetArena() == other->GetArena()) {
#else   // PROTOBUF_FORCE_COPY_IN_SWAP
    if (GetArena() == other->GetArena()) {
#endif  // !PROTOBUF_FORCE_COPY_IN_SWAP
      InternalSwap(other);
    } else {
      ::google::protobuf::internal::GenericSwap(this, other);
    }
  }
  void UnsafeArenaSwap(StatusResponse* other) {
    if (other == this) return;
    ABSL_DCHECK(GetArena() == other->GetArena());
    InternalSwap(other);
  }

  // implements Message ----------------------------------------------

  StatusResponse* New(::google::protobuf::Arena* arena = nullptr) const final {
    return ::google::protobuf::Message::DefaultConstruct<StatusResponse>(arena);
  }
  using ::google::protobuf::Message::CopyFrom;
  void CopyFrom(const StatusResponse& from);
  using ::google::protobuf::Message::MergeFrom;
  void MergeFrom(const StatusResponse& from) { StatusResponse::MergeImpl(*this, from); }

  private:
  static void MergeImpl(
      ::google::protobuf::MessageLite& to_msg,
      const ::google::protobuf::MessageLite& from_msg);

  public:
  bool IsInitialized() const {
    return true;
  }
  ABSL_ATTRIBUTE_REINITIALIZES void Clear() final;
  ::size_t ByteSizeLong() const final;
  ::uint8_t* _InternalSerialize(
      ::uint8_t* target,
      ::google::protobuf::io::EpsCopyOutputStream* stream) const final;
  int GetCachedSize() const { return _impl_._cached_size_.Get(); }

  private:
  void SharedCtor(::google::protobuf::Arena* arena);
  void SharedDtor();
  void InternalSwap(StatusResponse* other);
 private:
  friend class ::google::protobuf::internal::AnyMetadata;
  static ::absl::string_view FullMessageName() { return "mars.StatusResponse"; }

 protected:
  explicit StatusResponse(::google::protobuf::Arena* arena);
  StatusResponse(::google::protobuf::Arena* arena, const StatusResponse& from);
  StatusResponse(::google::protobuf::Arena* arena, StatusResponse&& from) noexcept
      : StatusResponse(arena) {
    *this = ::std::move(from);
  }
  const ::google::protobuf::Message::ClassData* GetClassData() const final;

 public:
  ::google::protobuf::Metadata GetMetadata() const;
  // nested types ----------------------------------------------------

  // accessors -------------------------------------------------------
  enum : int {
    kStatusFieldNumber = 1,
  };
  // string status = 1;
  void clear_status() ;
  const std::string& status() const;
  template <typename Arg_ = const std::string&, typename... Args_>
  void set_status(Arg_&& arg, Args_... args);
  std::string* mutable_status();
  PROTOBUF_NODISCARD std::string* release_status();
  void set_allocated_status(std::string* value);

  private:
  const std::string& _internal_status() const;
  inline PROTOBUF_ALWAYS_INLINE void _internal_set_status(
      const std::string& value);
  std::string* _internal_mutable_status();

  public:
  // @@protoc_insertion_point(class_scope:mars.StatusResponse)
 private:
  class _Internal;
  friend class ::google::protobuf::internal::TcParser;
  static const ::google::protobuf::internal::TcParseTable<
      0, 1, 0,
      34, 2>
      _table_;

  static constexpr const void* _raw_default_instance_ =
      &_StatusResponse_default_instance_;

  friend class ::google::protobuf::MessageLite;
  friend class ::google::protobuf::Arena;
  template <typename T>
  friend class ::google::protobuf::Arena::InternalHelper;
  using InternalArenaConstructable_ = void;
  using DestructorSkippable_ = void;
  struct Impl_ {
    inline explicit constexpr Impl_(
        ::google::protobuf::internal::ConstantInitialized) noexcept;
    inline explicit Impl_(::google::protobuf::internal::InternalVisibility visibility,
                          ::google::protobuf::Arena* arena);
    inline explicit Impl_(::google::protobuf::internal::InternalVisibility visibility,
                          ::google::protobuf::Arena* arena, const Impl_& from,
                          const StatusResponse& from_msg);
    ::google::protobuf::internal::ArenaStringPtr status_;
    mutable ::google::protobuf::internal::CachedSize _cached_size_;
    PROTOBUF_TSAN_DECLARE_MEMBER
  };
  union { Impl_ _impl_; };
  friend struct ::TableStruct_service_2eproto;
};
// -------------------------------------------------------------------

class StatusRequest final : public ::google::protobuf::internal::ZeroFieldsBase
/* @@protoc_insertion_point(class_definition:mars.StatusRequest) */ {
 public:
  inline StatusRequest() : StatusRequest(nullptr) {}
  template <typename = void>
  explicit PROTOBUF_CONSTEXPR StatusRequest(
      ::google::protobuf::internal::ConstantInitialized);

  inline StatusRequest(const StatusRequest& from) : StatusRequest(nullptr, from) {}
  inline StatusRequest(StatusRequest&& from) noexcept
      : StatusRequest(nullptr, std::move(from)) {}
  inline StatusRequest& operator=(const StatusRequest& from) {
    CopyFrom(from);
    return *this;
  }
  inline StatusRequest& operator=(StatusRequest&& from) noexcept {
    if (this == &from) return *this;
    if (GetArena() == from.GetArena()
#ifdef PROTOBUF_FORCE_COPY_IN_MOVE
        && GetArena() != nullptr
#endif  // !PROTOBUF_FORCE_COPY_IN_MOVE
    ) {
      InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }

  inline const ::google::protobuf::UnknownFieldSet& unknown_fields() const
      ABSL_ATTRIBUTE_LIFETIME_BOUND {
    return _internal_metadata_.unknown_fields<::google::protobuf::UnknownFieldSet>(::google::protobuf::UnknownFieldSet::default_instance);
  }
  inline ::google::protobuf::UnknownFieldSet* mutable_unknown_fields()
      ABSL_ATTRIBUTE_LIFETIME_BOUND {
    return _internal_metadata_.mutable_unknown_fields<::google::protobuf::UnknownFieldSet>();
  }

  static const ::google::protobuf::Descriptor* descriptor() {
    return GetDescriptor();
  }
  static const ::google::protobuf::Descriptor* GetDescriptor() {
    return default_instance().GetMetadata().descriptor;
  }
  static const ::google::protobuf::Reflection* GetReflection() {
    return default_instance().GetMetadata().reflection;
  }
  static const StatusRequest& default_instance() {
    return *internal_default_instance();
  }
  static inline const StatusRequest* internal_default_instance() {
    return reinterpret_cast<const StatusRequest*>(
        &_StatusRequest_default_instance_);
  }
  static constexpr int kIndexInFileMessages = 0;
  friend void swap(StatusRequest& a, StatusRequest& b) { a.Swap(&b); }
  inline void Swap(StatusRequest* other) {
    if (other == this) return;
#ifdef PROTOBUF_FORCE_COPY_IN_SWAP
    if (GetArena() != nullptr && GetArena() == other->GetArena()) {
#else   // PROTOBUF_FORCE_COPY_IN_SWAP
    if (GetArena() == other->GetArena()) {
#endif  // !PROTOBUF_FORCE_COPY_IN_SWAP
      InternalSwap(other);
    } else {
      ::google::protobuf::internal::GenericSwap(this, other);
    }
  }
  void UnsafeArenaSwap(StatusRequest* other) {
    if (other == this) return;
    ABSL_DCHECK(GetArena() == other->GetArena());
    InternalSwap(other);
  }

  // implements Message ----------------------------------------------

  StatusRequest* New(::google::protobuf::Arena* arena = nullptr) const final {
    return ::google::protobuf::internal::ZeroFieldsBase::DefaultConstruct<StatusRequest>(arena);
  }
  using ::google::protobuf::internal::ZeroFieldsBase::CopyFrom;
  inline void CopyFrom(const StatusRequest& from) {
    ::google::protobuf::internal::ZeroFieldsBase::CopyImpl(*this, from);
  }
  using ::google::protobuf::internal::ZeroFieldsBase::MergeFrom;
  void MergeFrom(const StatusRequest& from) {
    ::google::protobuf::internal::ZeroFieldsBase::MergeImpl(*this, from);
  }

  public:
  bool IsInitialized() const {
    return true;
  }
 private:
  friend class ::google::protobuf::internal::AnyMetadata;
  static ::absl::string_view FullMessageName() { return "mars.StatusRequest"; }

 protected:
  explicit StatusRequest(::google::protobuf::Arena* arena);
  StatusRequest(::google::protobuf::Arena* arena, const StatusRequest& from);
  StatusRequest(::google::protobuf::Arena* arena, StatusRequest&& from) noexcept
      : StatusRequest(arena) {
    *this = ::std::move(from);
  }
  const ::google::protobuf::internal::ZeroFieldsBase::ClassData* GetClassData() const final;

 public:
  ::google::protobuf::Metadata GetMetadata() const;
  // nested types ----------------------------------------------------

  // accessors -------------------------------------------------------
  // @@protoc_insertion_point(class_scope:mars.StatusRequest)
 private:
  class _Internal;
  friend class ::google::protobuf::internal::TcParser;
  static const ::google::protobuf::internal::TcParseTable<
      0, 0, 0,
      0, 2>
      _table_;

  static constexpr const void* _raw_default_instance_ =
      &_StatusRequest_default_instance_;

  friend class ::google::protobuf::MessageLite;
  friend class ::google::protobuf::Arena;
  template <typename T>
  friend class ::google::protobuf::Arena::InternalHelper;
  using InternalArenaConstructable_ = void;
  using DestructorSkippable_ = void;
  struct Impl_ {
    inline explicit constexpr Impl_(
        ::google::protobuf::internal::ConstantInitialized) noexcept;
    inline explicit Impl_(::google::protobuf::internal::InternalVisibility visibility,
                          ::google::protobuf::Arena* arena);
    inline explicit Impl_(::google::protobuf::internal::InternalVisibility visibility,
                          ::google::protobuf::Arena* arena, const Impl_& from,
                          const StatusRequest& from_msg);
    PROTOBUF_TSAN_DECLARE_MEMBER
  };
  friend struct ::TableStruct_service_2eproto;
};

// ===================================================================




// ===================================================================


#ifdef __GNUC__
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wstrict-aliasing"
#endif  // __GNUC__
// -------------------------------------------------------------------

// StatusRequest

// -------------------------------------------------------------------

// StatusResponse

// string status = 1;
inline void StatusResponse::clear_status() {
  ::google::protobuf::internal::TSanWrite(&_impl_);
  _impl_.status_.ClearToEmpty();
}
inline const std::string& StatusResponse::status() const
    ABSL_ATTRIBUTE_LIFETIME_BOUND {
  // @@protoc_insertion_point(field_get:mars.StatusResponse.status)
  return _internal_status();
}
template <typename Arg_, typename... Args_>
inline PROTOBUF_ALWAYS_INLINE void StatusResponse::set_status(Arg_&& arg,
                                                     Args_... args) {
  ::google::protobuf::internal::TSanWrite(&_impl_);
  _impl_.status_.Set(static_cast<Arg_&&>(arg), args..., GetArena());
  // @@protoc_insertion_point(field_set:mars.StatusResponse.status)
}
inline std::string* StatusResponse::mutable_status() ABSL_ATTRIBUTE_LIFETIME_BOUND {
  std::string* _s = _internal_mutable_status();
  // @@protoc_insertion_point(field_mutable:mars.StatusResponse.status)
  return _s;
}
inline const std::string& StatusResponse::_internal_status() const {
  ::google::protobuf::internal::TSanRead(&_impl_);
  return _impl_.status_.Get();
}
inline void StatusResponse::_internal_set_status(const std::string& value) {
  ::google::protobuf::internal::TSanWrite(&_impl_);
  _impl_.status_.Set(value, GetArena());
}
inline std::string* StatusResponse::_internal_mutable_status() {
  ::google::protobuf::internal::TSanWrite(&_impl_);
  return _impl_.status_.Mutable( GetArena());
}
inline std::string* StatusResponse::release_status() {
  ::google::protobuf::internal::TSanWrite(&_impl_);
  // @@protoc_insertion_point(field_release:mars.StatusResponse.status)
  return _impl_.status_.Release();
}
inline void StatusResponse::set_allocated_status(std::string* value) {
  ::google::protobuf::internal::TSanWrite(&_impl_);
  _impl_.status_.SetAllocated(value, GetArena());
  #ifdef PROTOBUF_FORCE_COPY_DEFAULT_STRING
        if (_impl_.status_.IsDefault()) {
          _impl_.status_.Set("", GetArena());
        }
  #endif  // PROTOBUF_FORCE_COPY_DEFAULT_STRING
  // @@protoc_insertion_point(field_set_allocated:mars.StatusResponse.status)
}

#ifdef __GNUC__
#pragma GCC diagnostic pop
#endif  // __GNUC__

// @@protoc_insertion_point(namespace_scope)
}  // namespace mars


// @@protoc_insertion_point(global_scope)

#include "google/protobuf/port_undef.inc"

#endif  // GOOGLE_PROTOBUF_INCLUDED_service_2eproto_2epb_2eh
