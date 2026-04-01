import React, { useEffect, useRef, useState } from "react";

import { nanoid } from "@reduxjs/toolkit";
import FormItem from "@theme/ApiDemoPanel/FormItem";
import FormMultiSelect from "@theme/ApiDemoPanel/FormMultiSelect";
import FormSelect from "@theme/ApiDemoPanel/FormSelect";
import FormTextInput from "@theme/ApiDemoPanel/FormTextInput";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";

import sharedStyles from "../shared.module.css";
import { setParam, Param } from "@theme/ApiDemoPanel/ParamOptions/slice";
import styles from "./styles.module.css";

const EMPTY_OPTION = "---";
const BOOLEAN_OPTIONS = ["true", "false"];

export interface ParamProps {
  param: Param;
}

function dispatchParamValue(
  dispatch: ReturnType<typeof useTypedDispatch>,
  param: Param,
  value?: Param["value"]
) {
  dispatch(
    setParam({
      ...param,
      value,
    })
  );
}

function resolveTextValue(param: Param, value: string) {
  return param.in === "path" || param.in === "query"
    ? value.replace(/\s/g, "%20")
    : value;
}

function resolveSelectedValues(event: React.ChangeEvent<HTMLSelectElement>) {
  return Array.prototype.filter
    .call(event.target.options, (option: HTMLOptionElement) => option.selected)
    .map((option: HTMLOptionElement) => option.value);
}

function ParamOption({ param }: ParamProps) {
  if (param.schema?.type === "array" && param.schema.items?.enum) {
    return <ParamMultiSelectFormItem param={param} />;
  }

  if (param.schema?.type === "array") {
    return <ParamArrayFormItem param={param} />;
  }

  if (param.schema?.enum) {
    return (
      <ParamSelectFormItem
        options={(param.schema.enum ?? []).map(String)}
        param={param}
      />
    );
  }

  if (param.schema?.type === "boolean") {
    return <ParamSelectFormItem options={BOOLEAN_OPTIONS} param={param} />;
  }

  return <ParamTextFormItem param={param} />;
}

function ParamOptionWrapper({ param }: ParamProps) {
  return (
    <FormItem
      description={param.description || param.schema?.description}
      label={param.name}
      required={param.required}
      type={param.in}
    >
      <ParamOption param={param} />
    </FormItem>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h5 className={sharedStyles.sectionTitle}>{title}</h5>
      <p className={sharedStyles.sectionDescription}>{description}</p>
    </>
  );
}

function ParamOptions() {
  const [showOptional, setShowOptional] = useState(false);

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);

  const allParams = [
    ...pathParams,
    ...queryParams,
    ...cookieParams,
    ...headerParams,
  ];

  if (allParams.length === 0) {
    return null;
  }

  const requiredParams = allParams.filter((param) => param.required);
  const optionalParams = allParams.filter((param) => !param.required);

  return (
    <>
      {requiredParams.length > 0 && renderSection(requiredParams, {
        description: "Complete these values before sending the live request.",
        title: "Required Parameters",
      })}

      {optionalParams.length > 0 && (
        <div className={sharedStyles.section}>
          <SectionHeading
            description="Use these filters and headers to refine the request when needed."
            title="Optional Parameters"
          />
          <button
            className={styles.toggleButton}
            onClick={() => setShowOptional((previous) => !previous)}
            type="button"
          >
            <span
              className={showOptional ? styles.toggleIconExpanded : styles.toggleIcon}
            >
              +
            </span>
            {showOptional
              ? "Hide optional parameters"
              : "Show optional parameters"}
          </button>

          <div
            className={
              showOptional ? styles.optionalContent : styles.optionalContentHidden
            }
          >
            {optionalParams.map((param) => (
              <ParamOptionWrapper key={`${param.in}-${param.name}`} param={param} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ArrayItem({
  param,
  value,
  onChange,
}: ParamProps & { value?: string; onChange(value?: string): void }) {
  if (param.schema?.items?.type === "boolean") {
    return (
      <div className={styles.arrayControl}>
        <FormSelect
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            const nextValue = event.target.value;
            onChange(nextValue === EMPTY_OPTION ? undefined : nextValue);
          }}
          options={[EMPTY_OPTION, ...BOOLEAN_OPTIONS]}
          value={value ?? EMPTY_OPTION}
        />
      </div>
    );
  }

  return (
    <div className={styles.arrayControl}>
      <FormTextInput
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value);
        }}
        placeholder={param.description || param.name}
        value={value ?? ""}
      />
    </div>
  );
}

function ParamArrayFormItem({ param }: ParamProps) {
  const [items, setItems] = useState<Array<{ id: string; value?: string }>>([]);
  const dispatch = useTypedDispatch();
  const paramRef = useRef(param);

  useEffect(() => {
    paramRef.current = param;
  }, [param]);

  useEffect(() => {
    const values = items
      .map((item) => item.value)
      .filter((item): item is string => Boolean(item));

    dispatchParamValue(
      dispatch,
      paramRef.current,
      values.length > 0 ? values : undefined
    );
  }, [dispatch, items]);

  return (
    <>
      {items.map((item) => (
        <div className={styles.arrayRow} key={item.id}>
          <ArrayItem
            onChange={(value) => {
              setItems((currentItems) =>
                currentItems.map((currentItem) =>
                  currentItem.id === item.id
                    ? { ...currentItem, value }
                    : currentItem
                )
              );
            }}
            param={param}
            value={item.value}
          />
          <button
            aria-label="Remove item"
            className={styles.iconButton}
            onClick={() => {
              setItems((currentItems) =>
                currentItems.filter((currentItem) => currentItem.id !== item.id)
              );
            }}
            type="button"
          >
            x
          </button>
        </div>
      ))}
      <button
        className={styles.secondaryButton}
        onClick={() => {
          setItems((currentItems) => [...currentItems, { id: nanoid() }]);
        }}
        type="button"
      >
        Add item
      </button>
    </>
  );
}

function ParamSelectFormItem({
  param,
  options,
}: ParamProps & { options: string[] }) {
  const dispatch = useTypedDispatch();

  return (
    <FormSelect
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatchParamValue(
          dispatch,
          param,
          event.target.value === EMPTY_OPTION ? undefined : event.target.value
        );
      }}
      options={[EMPTY_OPTION, ...options]}
      value={typeof param.value === "string" ? param.value : EMPTY_OPTION}
    />
  );
}

function ParamMultiSelectFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();
  const options = (param.schema?.items?.enum ?? []).map(String);

  return (
    <FormMultiSelect
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
        const values = resolveSelectedValues(event);
        dispatchParamValue(dispatch, param, values.length > 0 ? values : undefined);
      }}
      options={options}
    />
  );
}

function ParamTextFormItem({ param }: ParamProps) {
  const dispatch = useTypedDispatch();

  return (
    <FormTextInput
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        dispatchParamValue(dispatch, param, resolveTextValue(param, event.target.value))
      }
      placeholder={param.description || param.name}
    />
  );
}

function renderSection(
  params: Param[],
  copy: {
    title: string;
    description: string;
  }
) {
  return (
    <div className={sharedStyles.section}>
      <SectionHeading description={copy.description} title={copy.title} />
      {params.map((param) => (
        <ParamOptionWrapper key={`${param.in}-${param.name}`} param={param} />
      ))}
    </div>
  );
}

export default ParamOptions;
