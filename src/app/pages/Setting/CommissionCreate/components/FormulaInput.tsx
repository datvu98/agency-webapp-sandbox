import React, { useEffect, useState } from 'react';
import { Input, Tag, Row, Col, Typography } from 'antd';

const { Text } = Typography;

const FormulaInput = ({ value, onChange, tags, disabled }: any) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [error, setError] = useState('');

    const replaceTagValuesWithLabels = (input: string) => {
        let result = input;
        tags.forEach((tag: any) => {
            const tagValueRegex = new RegExp(`\\{${tag.value}\\}`, 'g');
            result = result.replace(tagValueRegex, `{${tag.label}}`);
        });
        return result;
    };

    useEffect(() => {
        setInputValue(replaceTagValuesWithLabels(value));
    }, [value]);

    const handleTagClick = (tagValue: any) => {
        const newValue = `${inputValue}{${tagValue?.label}}`;
        setInputValue(newValue);
        const replacedValue = tags.reduce((acc: string, tag: any) => {
            return acc.replace(new RegExp(`\\{${tag.label}\\}`, 'g'), `{${tag.value}}`);
        }, newValue);
        onChange(replacedValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const tagValues = tags.map((tag: any) => `\\{${tag.label}\\}`).join('|');
        const regex = new RegExp(`^([0-9.\\-+*/()]*(${tagValues})*)*$`);
        if (regex.test(value)) {
            setInputValue(value);
            const replacedValue = tags.reduce((acc: string, tag: any) => {
                return acc.replace(new RegExp(`\\{${tag.label}\\}`, 'g'), `{${tag.value}}`);
            }, value);
            onChange(replacedValue);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const cursorPosition = e.currentTarget.selectionStart;
            if (cursorPosition !== null && cursorPosition > 0) {
                const value = inputValue;
                const beforeCursor = value.slice(0, cursorPosition);
                const afterCursor = value.slice(cursorPosition);
                const tagMatch = beforeCursor.match(/\{[^\}]*\}$/);
                if (tagMatch && tagMatch.index !== undefined && tagMatch.index + tagMatch[0].length === cursorPosition) {
                    const newValue = beforeCursor.slice(0, tagMatch.index) + afterCursor;
                    setInputValue(newValue);
                    const replacedValue = tags.reduce((acc: string, tag: any) => {
                        return acc.replace(new RegExp(`\\{${tag.label}\\}`, 'g'), `{${tag.value}}`);
                    }, newValue);
                    onChange(replacedValue);
                    validateFormula(newValue);
                    e.preventDefault();
                }
            }
        }
    };

    const validateFormula = (formula: string) => {
        // Check for unmatched parentheses
        if (formula?.trim().length == 0) {
            setError('Vui lòng nhập công thức');
            return;
        }
        let stack: string[] = [];
        for (let char of formula) {
            if (char === '(') {
                stack.push(char);
            } else if (char === ')') {
                if (stack.length === 0) {
                    setError('Công thức không hợp lệ: dấu ngoặc không khớp');
                    return;
                }
                stack.pop();
            }
        }
        if (stack.length !== 0) {
            setError('Công thức không hợp lệ: dấu ngoặc không khớp');
            return;
        }

        // Check for invalid placement of operators
        const operatorRegex = /[+\-*/]/;
        const parts = formula.split(operatorRegex);
        for (let part of parts) {
            if (part.trim() === '') {
                setError('Công thức không hợp lệ: toán tử không hợp lệ');
                return;
            }
        }

        // Check for consecutive operators or dots
        if (/([+\-*/]{2,})|(\.\.)/.test(formula)) {
            setError('Công thức không hợp lệ: toán tử hoặc dấu chấm liên tiếp');
            return;
        }

        // Check for invalid placement of parentheses
        if (/\)\(/.test(formula)) {
            setError('Công thức không hợp lệ: dấu ngoặc không hợp lệ');
            return;
        }

        const tagLabels = tags.map((tag: any) => tag.label).join('|');
        const consecutiveTagsRegex = new RegExp(`\\{(${tagLabels})\\}\\{(${tagLabels})\\}`);
        if (consecutiveTagsRegex.test(formula)) {
            setError('Công thức không hợp lệ: hai tag liên tiếp không có toán tử');
            return;
        }

        setError('');
    };

    useEffect(() => {
        validateFormula(inputValue);
    }, [inputValue]);

    return (
        <>
            <Input
                placeholder="Nhập giá trị"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                disabled={disabled}
                className='custom-disabled-input'
            />
            {error && <Text type="danger">{error}</Text>}
            {!disabled && (
                <Row>
                    {tags.map((tag: any) => (
                        <Tag style={{ marginTop: 10, cursor: 'pointer' }} key={tag?.value} color="#87d068" onClick={() => handleTagClick(tag)}>
                            {tag?.label}
                        </Tag>
                    ))}
                </Row>
            )}
        </>
    );
};

export default FormulaInput;