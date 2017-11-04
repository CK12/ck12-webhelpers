import React from 'react';

export function renderChildren(children, newProps) {
    return React.Children.map(children, child => {
        return React.cloneElement(child, newProps);
    });
}