// src/components/common/Dropdown.js
// 通用下拉選單組件

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * 通用下拉選單組件
 * @param {Object} props - 組件props
 * @param {Array} props.options - 選項陣列
 * @param {Array|string} props.value - 選中的值（多選為陣列，單選為字串）
 * @param {Function} props.onChange - 值變更回調
 * @param {string} props.placeholder - 佔位符文字
 * @param {boolean} props.multiple - 是否多選
 * @param {boolean} props.searchable - 是否可搜尋
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.label - 標籤文字
 * @param {boolean} props.required - 是否必填
 * @param {string} props.error - 錯誤訊息
 * @param {number} props.maxHeight - 下拉清單最大高度（像素）
 * @param {Function} props.renderOption - 自訂選項渲染函數
 * @param {Function} props.getOptionLabel - 獲取選項標籤函數
 * @param {Function} props.getOptionValue - 獲取選項值函數
 * @returns {ReactNode}
 */
const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = '請選擇...',
  multiple = false,
  searchable = false,
  disabled = false,
  label,
  required = false,
  error,
  maxHeight = 256, // 預設高度到 16rem (256px)
  renderOption,
  getOptionLabel = (option) => option.label || option,
  getOptionValue = (option) => option.value || option,
  className = '',
  dropdownClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // 處理選項的標籤和值
  const processedOptions = options.map(option => ({
    label: getOptionLabel(option),
    value: getOptionValue(option),
    original: option
  }));

  // 篩選選項
  const filteredOptions = searchable && searchTerm
    ? processedOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processedOptions;

  // 獲取選中的選項
  const selectedOptions = multiple
    ? processedOptions.filter(option => Array.isArray(value) && value.includes(option.value))
    : processedOptions.find(option => option.value === value);

  // 顯示文字
  const displayText = () => {
    if (multiple) {
      const count = Array.isArray(value) ? value.length : 0;
      if (count === 0) return placeholder;
      return `已選擇 ${count} 項`;
    } else {
      return selectedOptions ? selectedOptions.label : placeholder;
    }
  };

  // 處理選項點擊
  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(optionValue)
        ? currentValue.filter(v => v !== optionValue)
        : [...currentValue, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // 清除選擇
  const clearSelection = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  // 全選/全不選
  const toggleSelectAll = () => {
    if (!multiple) return;
    
    const currentValue = Array.isArray(value) ? value : [];
    const allValues = filteredOptions.map(option => option.value);
    const isAllSelected = allValues.every(val => currentValue.includes(val));
    
    if (isAllSelected) {
      // 取消選中篩選結果中的所有項目
      const newValue = currentValue.filter(val => !allValues.includes(val));
      onChange(newValue);
    } else {
      // 選中篩選結果中的所有項目
      const newValue = [...new Set([...currentValue, ...allValues])];
      onChange(newValue);
    }
  };

  // 開啟/關閉下拉選單
  const toggleDropdown = () => {
    if (disabled) return;
    
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      // 延遲聚焦，確保下拉選單已渲染
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  };

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 鍵盤導航
  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleDropdown();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        break;
    }
  };

  // 檢查是否有選中項目
  const hasSelection = multiple 
    ? Array.isArray(value) && value.length > 0 
    : Boolean(value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* 標籤 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 主要輸入框 */}
      <div
        className={`
          relative w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors
          ${disabled 
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
            : isOpen 
              ? 'border-purple-500 ring-2 ring-purple-200' 
              : error
                ? 'border-red-300 hover:border-red-400'
                : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={`flex-1 truncate ${!hasSelection ? 'text-gray-500' : 'text-gray-900'}`}>
            {displayText()}
          </span>
          
          <div className="flex items-center space-x-1">
            {/* 清除按鈕 */}
            {hasSelection && !disabled && (
              <button
                onClick={clearSelection}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                tabIndex={-1}
                aria-label="清除選擇"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {/* 下拉箭頭 */}
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* 下拉選單 */}
      {isOpen && (
        <div 
          className={`
            absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl
            ${dropdownClassName}
          `}
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {/* 搜尋框 */}
          {searchable && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋選項..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* 全選/全不選 (僅多選模式) */}
          {multiple && filteredOptions.length > 0 && (
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <button
                onClick={toggleSelectAll}
                className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors font-medium"
              >
                {filteredOptions.every(option => 
                  Array.isArray(value) && value.includes(option.value)
                ) ? '取消全選' : '全選'}
              </button>
            </div>
          )}

          {/* 選項清單 */}
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - 120}px` }}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-gray-500 text-center">
                {searchTerm ? '找不到相關選項' : '沒有可用選項'}
              </div>
            ) : (
              <div role="listbox" className="py-1">
                {filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : option.value === value;

                  return (
                    <div
                      key={option.value}
                      onClick={() => handleOptionClick(option.value)}
                      className={`
                        px-4 py-3 cursor-pointer transition-all duration-150 flex items-center text-sm
                        ${isSelected 
                          ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500' 
                          : 'hover:bg-gray-50 text-gray-700'
                        }
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {multiple && (
                        <div className="mr-3 flex-shrink-0">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-primary-500 border-primary-500' 
                              : 'border-gray-300 hover:border-primary-400'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      )}
                      
                      <span className="flex-1 truncate">
                        {renderOption ? renderOption(option.original) : option.label}
                      </span>
                      
                      {!multiple && isSelected && (
                        <Check className="w-4 h-4 text-primary-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 選擇統計 */}
          {multiple && Array.isArray(value) && value.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-600 text-center">
                已選擇 {value.length} / {filteredOptions.length} 項
              </div>
            </div>
          )}
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;