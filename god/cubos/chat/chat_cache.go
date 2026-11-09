// cubos/chat/chat_cache.go
package chat

import (
    "encoding/json"
    "fmt"
    "time"

    "god/core"
)

func convKey(cid string) string { return fmt.Sprintf("chat:conv:%s", cid) }
func msgsKey(cid string) string { return fmt.Sprintf("chat:msgs:%s", cid) }

const dirtyKey = "chat:conversations:dirty"

func CacheConv(r *core.Gredis, conv *ConvDoc) error {
    b, err := json.Marshal(conv)
    if err != nil {
        return err
    }
    return r.Set(convKey(conv.CID), string(b), 3600)
}

func GetCachedConv(r *core.Gredis, cid string) (*ConvDoc, error) {
    val, err := r.Get(convKey(cid))
    if err != nil || val == "" {
        return nil, err
    }
    var conv ConvDoc
    if err := json.Unmarshal([]byte(val), &conv); err != nil {
        return nil, err
    }
    return &conv, nil
}

func CacheMessage(r *core.Gredis, msg *MsgDoc) error {
    b, err := json.Marshal(msg)
    if err != nil {
        return err
    }

    client := r.Client()
    if err := client.RPush(r.Ctx(), msgsKey(msg.CID), string(b)).Err(); err != nil {
        return err
    }
    return client.Expire(r.Ctx(), msgsKey(msg.CID), time.Hour).Err()
}

func MarkDirty(r *core.Gredis, cid string) error {
    return r.SAdd(dirtyKey, cid)
}

func ClearDirty(r *core.Gredis, cid string) error {
    return r.SRem(dirtyKey, cid)
}

func ListDirty(r *core.Gredis) ([]string, error) {
    return r.SMembers(dirtyKey)
}