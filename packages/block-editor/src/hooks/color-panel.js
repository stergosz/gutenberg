/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ContrastChecker from '../components/contrast-checker';
import ColorGradientControl from '../components/colors-gradients/control';
import InspectorControls from '../components/inspector-controls';
import useSetting from '../components/use-setting';
import { __unstableUseBlockRef as useBlockRef } from '../components/block-list/use-block-props/use-block-refs';

function getComputedStyle( node ) {
	return node.ownerDocument.defaultView.getComputedStyle( node );
}

export default function ColorPanel( {
	settings,
	clientId,
	enableContrastChecking = true,
} ) {
	const [ detectedBackgroundColor, setDetectedBackgroundColor ] = useState();
	const [ detectedColor, setDetectedColor ] = useState();
	const ref = useBlockRef( clientId );

	const colors = useSetting( 'color.palette' );
	const gradients = useSetting( 'color.gradients' );
	const disableCustomColors = ! useSetting( 'color.custom' );
	const disableCustomGradients = ! useSetting( 'color.customGradient' );

	useEffect( () => {
		if ( ! enableContrastChecking ) {
			return;
		}

		if ( ! ref.current ) {
			return;
		}
		setDetectedColor( getComputedStyle( ref.current ).color );

		let backgroundColorNode = ref.current;
		let backgroundColor = getComputedStyle( backgroundColorNode )
			.backgroundColor;
		while (
			backgroundColor === 'rgba(0, 0, 0, 0)' &&
			backgroundColorNode.parentNode &&
			backgroundColorNode.parentNode.nodeType ===
				backgroundColorNode.parentNode.ELEMENT_NODE
		) {
			backgroundColorNode = backgroundColorNode.parentNode;
			backgroundColor = getComputedStyle( backgroundColorNode )
				.backgroundColor;
		}

		setDetectedBackgroundColor( backgroundColor );
	} );

	return (
		<InspectorControls __experimentalGroup="color">
			{ settings.map( ( setting, index ) => (
				<ToolsPanelItem
					key={ index }
					hasValue={ setting.hasValue }
					label={ setting.label }
					onDeselect={ setting.onDeselect }
					isShownByDefault={ setting.isShownByDefault }
					resetAllFilter={ setting.resetAllFilter }
					panelId={ clientId }
				>
					<ColorGradientControl
						{ ...{
							colors,
							gradients,
							disableCustomColors,
							disableCustomGradients,
							clearable: false,
							label: setting.label,
							onColorChange: setting.onColorChange,
							onGradientChange: setting.onGradientChange,
							colorValue: setting.colorValue,
							gradientValue: setting.gradientValue,
						} }
						__experimentalHasMultipleOrigins
						__experimentalIsRenderedInSidebar
					/>
				</ToolsPanelItem>
			) ) }
			{ enableContrastChecking && (
				<ContrastChecker
					backgroundColor={ detectedBackgroundColor }
					textColor={ detectedColor }
				/>
			) }
		</InspectorControls>
	);
}
