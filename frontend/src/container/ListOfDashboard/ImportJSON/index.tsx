import { red } from '@ant-design/colors';
import { ExclamationCircleTwoTone } from '@ant-design/icons';
import {
	Button,
	Modal,
	notification,
	Space,
	Typography,
	Upload,
	UploadProps,
} from 'antd';
import createDashboard from 'api/dashboard/create';
import Editor from 'components/Editor';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { Dispatch } from 'redux';
import AppActions from 'types/actions';
import { FLUSH_DASHBOARD } from 'types/actions/dashboard';
import { DashboardData } from 'types/api/dashboard/getAll';

import { EditorContainer, FooterContainer } from './styles';

function ImportJSON({
	isImportJSONModalVisible,
	uploadedGrafana,
	onModalHandler,
}: ImportJSONProps): JSX.Element {
	const [jsonData, setJsonData] = useState<Record<string, unknown>>();
	const { t } = useTranslation(['dashboard', 'common']);
	const [isUploadJSONError, setIsUploadJSONError] = useState<boolean>(false);
	const [isCreateDashboardError, setIsCreateDashboardError] = useState<boolean>(
		false,
	);
	const dispatch = useDispatch<Dispatch<AppActions>>();

	const [dashboardCreating, setDashboardCreating] = useState<boolean>(false);

	const [editorValue, setEditorValue] = useState<string>('');

	const onChangeHandler: UploadProps['onChange'] = (info) => {
		const { fileList } = info;
		const reader = new FileReader();

		const lastFile = fileList[fileList.length - 1];

		if (lastFile.originFileObj) {
			reader.onload = async (event): Promise<void> => {
				if (event.target) {
					const target = event.target.result;
					try {
						if (target) {
							const targetFile = target.toString();
							const parsedValue = JSON.parse(targetFile);
							setJsonData(parsedValue);
							setEditorValue(JSON.stringify(parsedValue, null, 2));
							setIsUploadJSONError(false);
						}
					} catch (error) {
						setIsUploadJSONError(true);
					}
				}
			};
			reader.readAsText(lastFile.originFileObj);
		}
	};

	const onClickLoadJsonHandler = async (): Promise<void> => {
		try {
			setDashboardCreating(true);
			const dashboardData = JSON.parse(editorValue) as DashboardData;

			// removing the queryData
			const parsedWidgets: DashboardData = {
				...dashboardData,
				widgets: dashboardData.widgets?.map((e) => ({
					...e,
					queryData: {
						...e.queryData,
						data: e.queryData.data,
						error: false,
						errorMessage: '',
						loading: false,
					},
				})),
			};

			const response = await createDashboard({
				...parsedWidgets,
				uploadedGrafana,
			});

			if (response.statusCode === 200) {
				dispatch({
					type: FLUSH_DASHBOARD,
				});
				setTimeout(() => {
					history.push(
						generatePath(ROUTES.DASHBOARD, {
							dashboardId: response.payload.uuid,
						}),
					);
				}, 10);
			} else {
				setIsCreateDashboardError(true);
				notification.error({
					message:
						response.error ||
						t('something_went_wrong', {
							ns: 'common',
						}),
				});
			}
			setDashboardCreating(false);
		} catch {
			setDashboardCreating(false);

			setIsCreateDashboardError(true);
		}
	};

	const getErrorNode = (error: string): JSX.Element => (
		<Space>
			<ExclamationCircleTwoTone twoToneColor={[red[7], '#1f1f1f']} />
			<Typography style={{ color: '#D89614' }}>{error}</Typography>
		</Space>
	);

	return (
		<Modal
			open={isImportJSONModalVisible}
			centered
			maskClosable
			destroyOnClose
			width="70vw"
			onCancel={onModalHandler}
			title={
				<>
					<Typography.Title level={4}>{t('import_json')}</Typography.Title>
					<Typography>{t('import_dashboard_by_pasting')}</Typography>
				</>
			}
			footer={
				<FooterContainer>
					<Button
						disabled={editorValue.length === 0}
						onClick={onClickLoadJsonHandler}
						loading={dashboardCreating}
					>
						{t('load_json')}
					</Button>
					{isCreateDashboardError && getErrorNode(t('error_loading_json'))}
				</FooterContainer>
			}
		>
			<div>
				<Space direction="horizontal">
					<Upload
						accept=".json"
						showUploadList={false}
						multiple={false}
						onChange={onChangeHandler}
						beforeUpload={(): boolean => false}
						action="none"
						data={jsonData}
					>
						<Button type="primary">{t('upload_json_file')}</Button>
					</Upload>
					{isUploadJSONError && <>{getErrorNode(t('error_upload_json'))}</>}
				</Space>

				<EditorContainer>
					<Typography.Paragraph>{t('paste_json_below')}</Typography.Paragraph>
					<Editor
						onChange={(newValue): void => setEditorValue(newValue)}
						value={editorValue}
						language="json"
					/>
				</EditorContainer>
			</div>
		</Modal>
	);
}

interface ImportJSONProps {
	isImportJSONModalVisible: boolean;
	onModalHandler: VoidFunction;
	uploadedGrafana: boolean;
}

export default ImportJSON;
