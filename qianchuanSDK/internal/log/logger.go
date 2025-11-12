package log

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"runtime"
	"time"
)

// Logger 日志结构体
type Logger struct {
	*log.Logger
	level Level
}

// New 新的日志
func New(out io.Writer, prefix string, flag int, level Level) *Logger {
	return &Logger{
		Logger: log.New(out, prefix, flag),
		level:  level,
	}
}

var (
	std  = New(os.Stdout, DebugPrefix, log.LstdFlags, LogDebug)
	info = New(os.Stdout, InfoPrefix, log.LstdFlags, LogInfo)
	warn = New(os.Stdout, WarnPrefix, log.LstdFlags, LogWarn)
)

// Level 日志级别
type Level int

const (
	// LogDebug 调试模式
	LogDebug Level = iota

	// LogInfo 日志信息
	LogInfo

	// LogWarn 警告
	LogWarn
	
	// LogError 错误
	LogError
	
	// LogFatal 致命错误
	LogFatal
)

// String 返回级别名称
func (l Level) String() string {
	switch l {
	case LogDebug:
		return "DEBUG"
	case LogInfo:
		return "INFO"
	case LogWarn:
		return "WARN"
	case LogError:
		return "ERROR"
	case LogFatal:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

const (
	// InfoPrefix 信息前缀
	InfoPrefix = "[I] "

	// DebugPrefix 调试前缀
	DebugPrefix = "[D] "

	// WarnPrefix 警告前缀
	WarnPrefix = "[W] "
	
	// ErrorPrefix 错误前缀
	ErrorPrefix = "[E] "
	
	// FatalPrefix 致命错误前缀
	FatalPrefix = "[F] "
)

// Info 信息
func (l *Logger) Info(v ...interface{}) {
	l.output(LogInfo, v...)
}

func (l *Logger) output(level Level, v ...interface{}) {
	if l.level <= level {
		l.Logger.Println(v...)
	}
}

// Debug 调试
func (l *Logger) Debug(v ...interface{}) {
	l.output(LogDebug, v...)
}

// Warn 警告
func (l *Logger) Warn(v ...interface{}) {
	l.output(LogWarn, v...)
}

// Debug 调试
func Debug(v ...interface{}) {
	std.Debug(v...)
}

// Info 信息
func Info(v ...interface{}) {
	info.Info(v...)
}

// Warn 警告
func Warn(v ...interface{}) {
	warn.Warn(v...)
}

// Error 错误日志
func (l *Logger) Error(v ...interface{}) {
	l.output(LogError, v...)
}

// Error 错误
func Error(v ...interface{}) {
	errLogger := New(os.Stderr, ErrorPrefix, log.LstdFlags, LogError)
	errLogger.Error(v...)
}

// Fatal 致命错误日志
func (l *Logger) Fatal(v ...interface{}) {
	l.output(LogFatal, v...)
	os.Exit(1)
}

// Fatal 致命错误
func Fatal(v ...interface{}) {
	fatalLogger := New(os.Stderr, FatalPrefix, log.LstdFlags, LogFatal)
	fatalLogger.Fatal(v...)
}

// Errorf 格式化错误日志
func Errorf(format string, v ...interface{}) {
	Error(fmt.Sprintf(format, v...))
}

// Fatalf 格式化致命错误日志
func Fatalf(format string, v ...interface{}) {
	Fatal(fmt.Sprintf(format, v...))
}

// SetLevel 设置日志级别
func SetLevel(level Level) {
	std.level = level
	info.level = level
	warn.level = level
}

// StructuredLog 结构化日志
type StructuredLog struct {
	Timestamp string                 `json:"timestamp"`
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Fields    map[string]interface{} `json:"fields,omitempty"`
	File      string                 `json:"file,omitempty"`
	Line      int                    `json:"line,omitempty"`
}

// LogJSON 输出JSON格式日志
func LogJSON(level Level, message string, fields map[string]interface{}) {
	_, file, line, _ := runtime.Caller(1)
	
	log := StructuredLog{
		Timestamp: time.Now().Format(time.RFC3339),
		Level:     level.String(),
		Message:   message,
		Fields:    fields,
		File:      file,
		Line:      line,
	}
	
	jsonBytes, err := json.Marshal(log)
	if err != nil {
		Error("序列化日志失败:", err)
		return
	}
	
	fmt.Println(string(jsonBytes))
}

// DebugJSON 调试级别JSON日志
func DebugJSON(message string, fields map[string]interface{}) {
	LogJSON(LogDebug, message, fields)
}

// InfoJSON 信息级别JSON日志
func InfoJSON(message string, fields map[string]interface{}) {
	LogJSON(LogInfo, message, fields)
}

// WarnJSON 警告级别JSON日志
func WarnJSON(message string, fields map[string]interface{}) {
	LogJSON(LogWarn, message, fields)
}

// ErrorJSON 错误级别JSON日志
func ErrorJSON(message string, fields map[string]interface{}) {
	LogJSON(LogError, message, fields)
}
