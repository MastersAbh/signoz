import { LoadingOutlined } from '@ant-design/icons';
import { Button, Popover, Spin } from 'antd';
import { useIsDarkMode } from 'hooks/useDarkMode';
import React, { useState } from 'react';

import { Field } from './styles';

interface FieldItemProps {
	name: string;
	buttonIcon: React.ReactNode;
	buttonOnClick: (arg0: Record<string, unknown>) => void;
	fieldData: Record<string, never>;
	fieldIndex: number;
	isLoading: boolean;
	iconHoverText: string;
}
export function FieldItem({
	name,
	buttonIcon,
	buttonOnClick,
	fieldData,
	fieldIndex,
	isLoading,
	iconHoverText,
}: FieldItemProps): JSX.Element {
	const [isHovered, setIsHovered] = useState(false);
	const isDarkMode = useIsDarkMode();
	return (
		<Field
			onMouseEnter={(): void => {
				setIsHovered(true);
			}}
			onMouseLeave={(): void => setIsHovered(false)}
			isDarkMode={isDarkMode}
		>
			<span>{name}</span>
			{isLoading ? (
				<Spin spinning size="small" indicator={<LoadingOutlined spin />} />
			) : (
				isHovered &&
				buttonOnClick && (
					<Popover content={<span>{iconHoverText}</span>}>
						<Button
							type="text"
							size="small"
							icon={buttonIcon}
							onClick={(): void => buttonOnClick({ fieldData, fieldIndex })}
							style={{ color: 'inherit', padding: 0, height: '1rem', width: '1rem' }}
						/>
					</Popover>
				)
			)}
		</Field>
	);
}
