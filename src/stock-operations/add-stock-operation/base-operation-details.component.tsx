import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import {
  operationFromString,
  OperationType,
  StockOperationType,
} from "../../core/api/types/stockOperation/StockOperationType";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  today,
} from "../../constants";
import {
  Button,
  DatePicker,
  DatePickerInput,
  InlineLoading,
  TextInput,
} from "@carbon/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  adjustmentOperationSchema,
  operationSchema,
  StockOperationFormData,
  stockOperationSchema,
} from "../validation-schema";
import { Save } from "@carbon/react/icons";
import PartySelector from "../party-selector/party-selector.component";
import UsersSelector from "../users-selector/users-selector.component";
import { otherUser } from "../utils";
import ControlledTextInput from "../../core/components/carbon/controlled-text-input/controlled-text-input.component";
import StockOperationReasonSelector from "../stock-operation-reason-selector/stock-operation-reason-selector.component";
import ControlledTextArea from "../../core/components/carbon/controlled-text-area/controlled-text-area.component";
import { InitializeResult } from "./types";

interface BaseOperationDetailsProps {
  isEditing?: boolean;
  canEdit?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
}

const BaseOperationDetails: React.FC<BaseOperationDetailsProps> = ({
  model,
  onSave,
  operation,
  canEdit = true,
  isEditing,
  setup: {
    requiresStockAdjustmentReason: showReason,
    shouldLockSource: lockSource,
    shouldLockDestination: lockDestination,
    sourcePartyList,
    destinationPartyList,
  },
}) => {
  const { t } = useTranslation();

  const operationType = operationFromString(operation.operationType);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StockOperationFormData>({
    defaultValues: model,
    mode: "all",
    resolver: zodResolver(operationSchema(operationType)),
  });

  const [isOtherUser, setIsOtherUser] = useState<boolean | null>();

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (item: StockOperationDTO) => {
    try {
      setIsSaving(true);

      // Restore uuid
      const req = Object.assign(model, item);
      delete req.submitted;
      delete req.cancelledByFamilyName;
      delete req.atLocationName;
      delete req.completedByGivenName;
      delete req.cancelledBy;
      delete req.submittedByFamilyName;
      delete req.operationOrder;
      delete req.dispatchedByGivenName;
      delete req.submittedByGivenName;
      delete req.returnedByGivenName;
      delete req.operationNumber;
      delete req.responsiblePersonFamilyName;
      delete req.returnReason;
      delete req.atLocationUuid;
      delete req.cancelReason;
      delete req.rejectedByGivenName;
      delete req.reasonName;
      delete req.submittedBy;
      delete req.creator;
      delete req.completedByFamilyName;
      delete req.operationTypeName;
      delete req.rejectedByFamilyName;
      delete req.responsiblePerson;
      delete req.creatorFamilyName;
      delete req.returnedByFamilyName;
      delete req.cancelledByGivenName;
      delete req.operationType;
      delete req.responsiblePersonGivenName;
      delete req.sourceName;
      delete req.rejectionReason;
      delete req.completedBy;
      delete req.creatorGivenName;
      delete req.dispatchedByFamilyName;
      delete req.uuid;
      if ([OperationType.ADJUSTMENT_OPERATION_TYPE].includes(operationType)) {
        delete req.destinationName;
        delete req.destinationUuid;
      }

      await onSave(req);
    } catch (e) {
      // Show notification
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={`formContainer verticalForm`}>
      {canEdit && (
        <Controller
          control={control}
          render={({ field: { onChange } }) => (
            <DatePicker
              datePickerType="single"
              maxDate={formatForDatePicker(today())}
              locale="en"
              dateFormat={DATE_PICKER_CONTROL_FORMAT}
              onChange={onChange}
            >
              <DatePickerInput
                invalid={!!errors.operationDate}
                invalidText={errors?.operationDate?.message}
                id="operationDate"
                name="operationDate"
                placeholder={DATE_PICKER_FORMAT}
                labelText={t("operationDate", "Operation Date")}
                value={formatForDatePicker(model?.operationDate)}
              />
            </DatePicker>
          )}
          name="operationDate"
        />
      )}

      {!canEdit && (
        <>
          <TextInput
            id="operationDateLbl"
            value={formatForDatePicker(model?.operationDate)}
            readOnly={true}
            labelText="Operation Date"
          />
        </>
      )}

      {isEditing && model?.operationNumber && (
        <TextInput
          id="operationNoLbl"
          value={model?.operationNumber}
          readOnly={true}
          labelText={"Operation Number:"}
        />
      )}

      {canEdit && !lockSource && operation?.hasSource && (
        <PartySelector
          controllerName="sourceUuid"
          name="sourceUuid"
          control={control}
          title={
            operation?.hasDestination
              ? t("from:", "From:")
              : t("location:", "Location:")
          }
          placeholder={
            operation.hasDestination
              ? t("chooseASource", "Choose a source")
              : t("chooseALocation", "Choose a location")
          }
          invalid={!!errors.sourceUuid}
          invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
          parties={sourcePartyList || []}
        />
      )}

      {(!canEdit || lockSource) && operation?.hasSource && (
        <TextInput
          id="sourceUuidLbl"
          value={model?.sourceName ?? ""}
          readOnly={true}
          labelText={operation?.hasDestination ? "From:" : "Location:"}
        />
      )}

      {canEdit && !lockDestination && operation?.hasDestination && (
        <PartySelector
          controllerName="destinationUuid"
          name="destinationUuid"
          control={control}
          title={operation?.hasSource ? "To:" : "Location:"}
          placeholder={
            operation?.hasSource
              ? t("chooseADestination", "Choose a destination")
              : "Location"
          }
          invalid={!!errors.sourceUuid}
          invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
          parties={destinationPartyList || []}
        />
      )}

      {(!canEdit || lockDestination) && operation?.hasDestination && (
        <TextInput
          id="destinationUuidLbl"
          value={model?.destinationName ?? ""}
          readOnly={true}
          labelText={operation?.hasSource ? "To:" : "Location:"}
        />
      )}

      {canEdit && (
        <UsersSelector
          controllerName="responsiblePersonUuid"
          name="responsiblePersonUuid"
          control={control}
          title={t("responsiblePerson:", "Responsible Person:")}
          placeholder={t("filter", "Filter ...")}
          invalid={!!errors.responsiblePersonUuid}
          invalidText={
            errors.responsiblePersonUuid &&
            errors?.responsiblePersonUuid?.message
          }
          onUserChanged={(user) => {
            if (user.uuid === otherUser.uuid) {
              setIsOtherUser(true);
            }
          }}
        />
      )}

      {isOtherUser && (
        <ControlledTextInput
          id="responsiblePersonOther"
          name="responsiblePersonOther"
          control={control}
          controllerName="responsiblePersonOther"
          maxLength={255}
          size={"md"}
          value={`${model?.responsiblePersonOther ?? ""}`}
          labelText={t("responsiblePerson", "Responsible Person:")}
          placeholder={t("pleaseSpecify", "Please Specify:")}
          invalid={!!errors.responsiblePersonOther}
          invalidText={
            errors.responsiblePersonOther &&
            errors?.responsiblePersonOther?.message
          }
        />
      )}

      {!canEdit && (
        <TextInput
          id="responsiblePersonLbl"
          value={
            (model?.responsiblePersonUuid &&
            model?.responsiblePersonUuid !== otherUser.uuid
              ? `${model?.responsiblePersonFamilyName} ${model?.responsiblePersonGivenName}`
              : model?.responsiblePersonOther) ?? ""
          }
          readOnly={true}
          labelText={"Responsible Person"}
        />
      )}

      {showReason && canEdit && (
        <StockOperationReasonSelector
          controllerName="reasonUuid"
          name="reasonUuid"
          control={control}
          placeholder={t("chooseAReason", "Choose a reason")}
          title={t("reason", "Reason:")}
          invalid={!!errors.reasonUuid}
          invalidText={errors.reasonUuid && errors?.reasonUuid?.message}
        />
      )}

      {showReason && !canEdit && (
        <TextInput
          id="reasonUuidLbl"
          value={model?.reasonName ?? ""}
          readOnly={true}
          labelText={"Reason:"}
        />
      )}

      <ControlledTextArea
        id="remarks"
        name="remarks"
        control={control}
        controllerName="remarks"
        maxLength={255}
        value={`${model?.remarks ?? ""}`}
        labelText={t("remarks:", "Remarks:")}
        invalid={!!errors.remarks}
        invalidText={errors.remarks && errors?.remarks?.message}
      />

      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <Button
          name="save"
          type="button"
          className="submitButton"
          onClick={handleSubmit(handleSave)}
          kind="primary"
          renderIcon={Save}
        >
          {isSaving ? <InlineLoading /> : t("save", "Save")}
        </Button>
      </div>
    </form>
  );
};

export default BaseOperationDetails;
