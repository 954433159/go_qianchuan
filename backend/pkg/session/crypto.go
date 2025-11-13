package session

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
)

// TokenCrypto Token加密解密工具
type TokenCrypto struct {
	gcm cipher.AEAD
}

// NewTokenCrypto 创建Token加密工具
// secret: 加密密钥（建议使用32字节）
func NewTokenCrypto(secret string) (*TokenCrypto, error) {
	// 使用SHA256将secret标准化为32字节密钥
	hash := sha256.Sum256([]byte(secret))

	block, err := aes.NewCipher(hash[:])
	if err != nil {
		return nil, fmt.Errorf("创建AES cipher失败: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("创建GCM失败: %w", err)
	}

	return &TokenCrypto{gcm: gcm}, nil
}

// Encrypt 加密Token
func (tc *TokenCrypto) Encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	// 生成随机nonce
	nonce := make([]byte, tc.gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("生成nonce失败: %w", err)
	}

	// 加密
	ciphertext := tc.gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// 返回Base64编码的密文
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt 解密Token
func (tc *TokenCrypto) Decrypt(ciphertext string) (string, error) {
	if ciphertext == "" {
		return "", nil
	}

	// Base64解码
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", fmt.Errorf("Base64解码失败: %w", err)
	}

	nonceSize := tc.gcm.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("密文长度不足")
	}

	// 提取nonce和密文
	nonce, ciphertextBytes := data[:nonceSize], data[nonceSize:]

	// 解密
	plaintext, err := tc.gcm.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return "", fmt.Errorf("解密失败: %w", err)
	}

	return string(plaintext), nil
}

// EncryptUserSession 加密会话中的敏感Token
func (tc *TokenCrypto) EncryptUserSession(session *UserSession) error {
	encryptedAccessToken, err := tc.Encrypt(session.AccessToken)
	if err != nil {
		return fmt.Errorf("加密AccessToken失败: %w", err)
	}

	encryptedRefreshToken, err := tc.Encrypt(session.RefreshToken)
	if err != nil {
		return fmt.Errorf("加密RefreshToken失败: %w", err)
	}

	session.AccessToken = encryptedAccessToken
	session.RefreshToken = encryptedRefreshToken
	return nil
}

// DecryptUserSession 解密会话中的敏感Token
func (tc *TokenCrypto) DecryptUserSession(session *UserSession) error {
	decryptedAccessToken, err := tc.Decrypt(session.AccessToken)
	if err != nil {
		return fmt.Errorf("解密AccessToken失败: %w", err)
	}

	decryptedRefreshToken, err := tc.Decrypt(session.RefreshToken)
	if err != nil {
		return fmt.Errorf("解密RefreshToken失败: %w", err)
	}

	session.AccessToken = decryptedAccessToken
	session.RefreshToken = decryptedRefreshToken
	return nil
}
