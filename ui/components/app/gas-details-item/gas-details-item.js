import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { TextColor } from '../../../helpers/constants/design-system';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import {
  getPreferences,
  getUseCurrencyRateCheck,
  transactionFeeSelector,
} from '../../../selectors';
import { getCurrentDraftTransaction } from '../../../ducks/send';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { useI18nContext } from '../../../hooks/useI18nContext';

import Box from '../../ui/box';
import LoadingHeartBeat from '../../ui/loading-heartbeat';
import GasTiming from '../gas-timing/gas-timing.component';
import TransactionDetailItem from '../transaction-detail-item/transaction-detail-item.component';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import { hexWEIToDecGWEI } from '../../../../shared/modules/conversion.utils';
import { useDraftTransactionGasValues } from '../../../hooks/useDraftTransactionGasValues';
import GasDetailsItemTitle from './gas-details-item-title';

const GasDetailsItem = ({ userAcknowledgedGasMissing = false }) => {
  const t = useI18nContext();
  const draftTransaction = useSelector(getCurrentDraftTransaction);
  const { transactionData } = useDraftTransactionGasValues();

  const {
    hexMinimumTransactionFee: draftHexMinimumTransactionFee,
    hexMaximumTransactionFee: draftHexMaximumTransactionFee,
  } = useSelector((state) => transactionFeeSelector(state, transactionData));

  const {
    estimateUsed,
    hasSimulationError,
    maximumCostInHexWei: hexMaximumTransactionFee,
    minimumCostInHexWei: hexMinimumTransactionFee,
    maxPriorityFeePerGas,
    maxFeePerGas,
  } = useGasFeeContext();

  const { useNativeCurrencyAsPrimaryCurrency } = useSelector(getPreferences);

  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);

  if (hasSimulationError && !userAcknowledgedGasMissing) {
    return null;
  }

  return (
    <TransactionDetailItem
      key="gas-details-item"
      detailTitle={<GasDetailsItemTitle />}
      detailTitleColor={TextColor.textDefault}
      detailText={
        useCurrencyRateCheck &&
        Object.keys(draftTransaction).length === 0 && (
          <div className="gas-details-item__currency-container">
            <LoadingHeartBeat estimateUsed={estimateUsed} />
            <UserPreferencedCurrencyDisplay
              type={SECONDARY}
              value={hexMinimumTransactionFee}
              hideLabel={Boolean(useNativeCurrencyAsPrimaryCurrency)}
            />
          </div>
        )
      }
      detailTotal={
        <div className="gas-details-item__currency-container">
          <LoadingHeartBeat estimateUsed={estimateUsed} />
          <UserPreferencedCurrencyDisplay
            type={PRIMARY}
            value={hexMinimumTransactionFee || draftHexMinimumTransactionFee}
            hideLabel={!useNativeCurrencyAsPrimaryCurrency}
          />
        </div>
      }
      subText={
        <>
          <Box
            key="editGasSubTextFeeLabel"
            display="inline-flex"
            className={classNames('gas-details-item__gasfee-label', {
              'gas-details-item__gas-fee-warning': estimateUsed === 'high',
            })}
          >
            <LoadingHeartBeat estimateUsed={estimateUsed} />
            <Box marginRight={1}>
              <strong>
                {estimateUsed === 'high' && '⚠ '}
                {t('editGasSubTextFeeLabel')}
              </strong>
            </Box>
            <div
              key="editGasSubTextFeeValue"
              className="gas-details-item__currency-container"
            >
              <LoadingHeartBeat estimateUsed={estimateUsed} />
              <UserPreferencedCurrencyDisplay
                key="editGasSubTextFeeAmount"
                type={PRIMARY}
                value={
                  hexMaximumTransactionFee || draftHexMaximumTransactionFee
                }
                hideLabel={!useNativeCurrencyAsPrimaryCurrency}
              />
            </div>
          </Box>
        </>
      }
      subTitle={
        <GasTiming
          maxPriorityFeePerGas={(
            maxPriorityFeePerGas ||
            hexWEIToDecGWEI(transactionData.txParams.maxPriorityFeePerGas)
          ).toString()}
          maxFeePerGas={(
            maxFeePerGas ||
            hexWEIToDecGWEI(transactionData.txParams.maxFeePerGas)
          ).toString()}
        />
      }
    />
  );
};

GasDetailsItem.propTypes = {
  userAcknowledgedGasMissing: PropTypes.bool,
};

export default GasDetailsItem;
